import cloudinary
import cloudinary.uploader
from decouple import config
cloud_name=config('CLOUDINARY_CLOUD_NAME')
api_key=config('CLOUDINARY_API_KEY')
api_secret=config('CLOUDINARY_API_SECRET')
secure=config('CLOUDINARY_SECURE')
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=secure
)

def upload_image_to_cloudinary(image_file):
    print(api_key)
    try:
        result = cloudinary.uploader.upload(image_file)
        # print(result)
        return result.get('secure_url')
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
