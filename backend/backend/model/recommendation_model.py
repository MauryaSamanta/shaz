# from sklearn.linear_model import SGDClassifier
# import numpy as np
# import joblib
# import os
# from decouple import config
# from supabase import create_client

# MODEL_PATH = "model/saved_model.pkl"
# CLASSES = np.array([0, 1])  # 0 = dislike, 1 = like
# SUPABASE_MODEL=config("SUPABASE_URL")
# SUPABASE_KEY=config("SUPABASE_KEY")
# SUPABASE_BUCKET = config("SUPABASE_BUCKET")

# supabase = create_client(SUPABASE_MODEL, SUPABASE_KEY)
# def initialize_model():
#     model = SGDClassifier(loss="log_loss")  # Logistic Regression-style
#     # Dummy 1024-dim input to initialize shape
#     model.partial_fit(np.zeros((1, 1024)), [0], classes=CLASSES)
#     joblib.dump(model, MODEL_PATH)
#     return model

# def load_model():
#     if not os.path.exists(MODEL_PATH):
#         return initialize_model()
#     return joblib.load(MODEL_PATH)

# def update_model(user_vector, item_vector, label):
#     model = load_model()

#     # Combine user and item embeddings
#     combined_vector = np.concatenate([user_vector, item_vector]).reshape(1, -1)  # shape (1, 1024)
#     y = np.array([label])

#     # Train
#     model.partial_fit(combined_vector, y)
#     joblib.dump(model, MODEL_PATH)

# def upload_model_to_supabase():
#     file_name = os.path.basename(MODEL_PATH)
#     try:
#         # Optional: remove existing file to mimic 'upsert'
       

#         # Open file as binary stream and pass directly
#         with open(MODEL_PATH, "rb") as f:
           
#             response = (
#                 supabase.storage
#                 .from_(SUPABASE_BUCKET)
#                 .upload(
#                     file=f,
#                     path="saved_model.pkl",
#                     file_options={"cache-control": "3600", "upsert": "true"}
#                 )
#             )
#         print("✅ Model uploaded successfully to Supabase.")
#     except Exception as e:
#         print(f"❌ Failed to upload model to Supabase: {e}")
from sklearn.linear_model import SGDRegressor
import numpy as np
import joblib
import os
from decouple import config
from supabase import create_client

from api.views.recommendation_views import download_model_from_url

MODEL_PATH = "model/saved_model.pkl"

SUPABASE_MODEL=config("SUPABASE_MODEL")
SUPABASE_URL=config("SUPABASE_URL")
SUPABASE_KEY=config("SUPABASE_KEY")
SUPABASE_BUCKET = config("SUPABASE_BUCKET")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
def initialize_model():
    model = SGDRegressor(loss="squared_error", learning_rate="constant", eta0=0.01)
    # Dummy fit to initialize (SGDRegressor needs at least 1 sample)
    model.partial_fit(np.zeros((1, 1024)), [0.0])
    joblib.dump(model, MODEL_PATH)
    return model

def load_model():
    if not os.path.exists(MODEL_PATH):
         download_model_from_url(SUPABASE_MODEL, save_to_path=MODEL_PATH)
    return joblib.load(MODEL_PATH)

def update_model(user_vector, item_vector, label):
    model = load_model()

    combined_vector = np.concatenate([user_vector, item_vector]).reshape(1, -1)
    y = np.array([label], dtype=float)

    model.partial_fit(combined_vector, y)
    joblib.dump(model, MODEL_PATH)

def upload_model_to_supabase():
    file_name = os.path.basename(MODEL_PATH)
    try:
        # Optional: remove existing file to mimic 'upsert'
       

        # Open file as binary stream and pass directly
        with open(MODEL_PATH, "rb") as f:
           
            response = (
                supabase.storage
                .from_(SUPABASE_BUCKET)
                .upload(
                    file=f,
                    path="saved_model.pkl",
                    file_options={"cache-control": "3600", "upsert": "true"}
                )
            )
        print("✅ Model uploaded successfully to Supabase.")
    except Exception as e:
        print(f"❌ Failed to upload model to Supabase: {e}")
