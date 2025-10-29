# hybrid_recommender.py
import json
import os
import joblib
import numpy as np
import pandas as pd
from decouple import config
from supabase import create_client
from xgboost import XGBRegressor
from sklearn.linear_model import SGDRegressor
from sklearn.utils import shuffle

# paths
SGD_MODEL_PATH = "model/sgd_model.pkl"
XGB_MODEL_PATH = "model/xgb_model.json"   # XGBoost native save
TRAIN_LOG_PATH = "data/interaction_log.parquet"  # your accumulated training log

# supabase config (reuse your vars)
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")
SUPABASE_BUCKET = config("SUPABASE_BUCKET")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# create folder if it doesn't exist
os.makedirs(os.path.dirname(TRAIN_LOG_PATH), exist_ok=True)
# model params
COMBINED_DIM = 1024  # set to actual combined dim
SGD_INIT_EPOCHS = 1  # how many passes over bootstrap dataset for warm-start
BOOTSTRAP_SAMPLE_SIZE = 20000  # sample size for bootstrap (tune)
ALPHA = 0.6  # blending weight for SGD in inference (tune)

# ----- helper: initialize or load SGD -----
def initialize_sgd():
    sgd = SGDRegressor(loss="squared_error", learning_rate="constant", eta0=0.01)
    # partial_fit needs at least one sample to initialize; use zeros
    sgd.partial_fit(np.zeros((1, COMBINED_DIM)), [0.0])
    joblib.dump(sgd, SGD_MODEL_PATH)
    return sgd

def load_sgd():
    if not os.path.exists(SGD_MODEL_PATH):
        return initialize_sgd()
    return joblib.load(SGD_MODEL_PATH)

# ----- helper: load/save XGB -----
def save_xgb(xgb_model):
    # XGBoost native save
    xgb_model.save_model(XGB_MODEL_PATH)

def load_xgb(local_path=None):
    path = local_path or XGB_MODEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"XGBoost model not found at {path}")
    xgb = XGBRegressor()
    xgb.load_model(path)
    return xgb

# ----- upload / download utilities for Supabase (optional) -----
def upload_file_to_supabase(local_path, remote_path):
    with open(local_path, "rb") as f:
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            file=f,
            path=remote_path,
            file_options={"cache-control":"3600", "upsert": True}
        )

def download_file_from_supabase(remote_path, local_path):
    # use your existing download function or Supabase client to fetch
    data = supabase.storage.from_(SUPABASE_BUCKET).download(remote_path)
    with open(local_path, "wb") as f:
        f.write(data)
    return local_path

# ----- Offline: train XGBoost on interaction logs -----
def train_xgb_from_log(
    log_path=TRAIN_LOG_PATH,
    target_col="label",
    feature_col="combined_vector",
    num_boost_round=200,
    max_depth=6,
    lr=0.05
):
    """
    Trains XGBoost model using logged user interactions.
    The 'combined_vector' column is stored as JSON string — so we decode it.
    """
    if not os.path.exists(log_path):
        raise FileNotFoundError("Training log not found.")

    df = pd.read_parquet(log_path)

    # ✅ Decode JSON strings back to numpy arrays
    df[feature_col] = df[feature_col].apply(lambda s: np.array(json.loads(s), dtype=np.float32))

    X = np.vstack(df[feature_col].values).astype(np.float32)
    y = df[target_col].astype(np.float32).values

    X, y = shuffle(X, y, random_state=42)

    xgb = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=num_boost_round,
        max_depth=max_depth,
        learning_rate=lr,
        tree_method="hist"
    )

    xgb.fit(X, y, verbose=True)
    save_xgb(xgb)

    try:
        upload_file_to_supabase(XGB_MODEL_PATH, "xgb_models/xgb_latest.json")
    except Exception as e:
        print("Upload failed:", e)

    return xgb


def bootstrap_sgd_from_xgb(
    sgd: SGDRegressor = None,
    xgb: XGBRegressor = None,
    log_path=TRAIN_LOG_PATH,
    sample_size=BOOTSTRAP_SAMPLE_SIZE,
    n_epochs=SGD_INIT_EPOCHS
):
    """
    Bootstraps SGD model using XGB predictions as pseudo-labels.
    """
    if sgd is None:
        sgd = load_sgd()
    if xgb is None:
        xgb = load_xgb()

    if not os.path.exists(log_path):
        print("No training log found - skipping bootstrap.")
        return sgd

    df = pd.read_parquet(log_path)
    if len(df) == 0:
        print("Empty log - skipping bootstrap.")
        return sgd

    sample_n = min(sample_size, len(df))
    df_sample = df.sample(sample_n, random_state=42)

    # ✅ Decode JSON strings back to numpy arrays
    df_sample["combined_vector"] = df_sample["combined_vector"].apply(lambda s: np.array(json.loads(s), dtype=np.float32))

    X_boot = np.ascontiguousarray(np.vstack(df_sample["combined_vector"].values), dtype=np.float64)
    y_xgb = np.ascontiguousarray(xgb.predict(X_boot).ravel(), dtype=np.float64)

    for epoch in range(n_epochs):
        sgd.partial_fit(X_boot, y_xgb)

    joblib.dump(sgd, SGD_MODEL_PATH)
    return sgd
# ----- Online update (call on each swipe) -----
def update_online(user_vector, item_vector, label):
    sgd = load_sgd()
    x = np.concatenate([user_vector, item_vector]).reshape(1, -1)
    y = np.array([float(label)])
    sgd.partial_fit(x, y)
    joblib.dump(sgd, SGD_MODEL_PATH)

# ----- Inference: blend -----
def predict_score(user_vector, item_vector, alpha=ALPHA):
    x = np.concatenate([user_vector, item_vector]).reshape(1, -1)
    sgd = load_sgd()
    # attempt to load xgb; if fails fallback to sgd
    try:
        xgb = load_xgb()
        y_xgb = xgb.predict(x)[0]
    except Exception:
        y_xgb = 0.0

    y_sgd = sgd.predict(x)[0]
    return float(alpha * y_sgd + (1 - alpha) * y_xgb)

# ----- utilities to append new interactions to log -----
def append_interaction_to_log(user_id, item_id, combined_vector, label, log_path=TRAIN_LOG_PATH):
    # ✅ Convert to JSON string before saving
    row = {
        "user_id": user_id,
        "item_id": item_id,
        "combined_vector": json.dumps(list(map(float, combined_vector))),  # safe for parquet
        "label": float(label),
        "ts": pd.Timestamp.utcnow()
    }

    df_row = pd.DataFrame([row])

    if os.path.exists(log_path):
        df_old = pd.read_parquet(log_path)
        df_concat = pd.concat([df_old, df_row], ignore_index=True)
        df_concat.to_parquet(log_path, index=False)
    else:
        df_row.to_parquet(log_path, index=False)
