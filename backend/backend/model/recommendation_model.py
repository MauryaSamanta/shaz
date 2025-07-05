from sklearn.linear_model import SGDClassifier
import numpy as np
import joblib
import os

MODEL_PATH = "model/saved_model.pkl"
CLASSES = np.array([0, 1])  # 0 = dislike, 1 = like

def initialize_model():
    model = SGDClassifier(loss="log_loss")  # Logistic Regression-style
    # Dummy 1024-dim input to initialize shape
    model.partial_fit(np.zeros((1, 1024)), [0], classes=CLASSES)
    joblib.dump(model, MODEL_PATH)
    return model

def load_model():
    if not os.path.exists(MODEL_PATH):
        return initialize_model()
    return joblib.load(MODEL_PATH)

def update_model(user_vector, item_vector, label):
    model = load_model()

    # Combine user and item embeddings
    combined_vector = np.concatenate([user_vector, item_vector]).reshape(1, -1)  # shape (1, 1024)
    y = np.array([label])

    # Train
    model.partial_fit(combined_vector, y)
    joblib.dump(model, MODEL_PATH)
