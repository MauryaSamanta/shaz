import requests
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
from io import BytesIO

# Load model once
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_image_embedding_from_url(image_url: str) -> list:
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        image = Image.open(BytesIO(response.content)).convert("RGB")

        inputs = clip_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = clip_model.get_image_features(**inputs)

        # Normalize + convert to list for DB storage
        embedding = outputs[0]
        embedding = embedding / embedding.norm(p=2)
        return embedding.tolist()

    except Exception as e:
        print(f"[Embedder Error] Failed to embed image: {e}")
        return None
