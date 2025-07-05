
from django.apps import AppConfig
import os

class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        from model.recommendation_model import load_model
        os.makedirs("model", exist_ok=True)  # Ensure model dir exists
        load_model()  # This will initialize if not already
