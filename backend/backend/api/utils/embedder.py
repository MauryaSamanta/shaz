import requests

MODAL_EMBEDDING_FUNCTION_URL = "https://mauryasamanta1508--shazlo-clip-embedder-embed-webhook.modal.run"  # Replace this with the actual Modal function URL

def get_image_embedding_from_url(image_url):
    try:
        response = requests.post(
            MODAL_EMBEDDING_FUNCTION_URL,
            params = {"image_url": image_url},
            timeout=10
        )
        response.raise_for_status()
        return response.json().get("embedding")
    except Exception as e:
        raise Exception(f"Modal embedding failed: {str(e)}")
