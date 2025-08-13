import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name='dvk3egaob',
    api_key='151628288373664',
    api_secret='9_ssy5T7HkH1X1tNYX3NbWpupxs',
    secure=True
)

def upload_image_to_cloudinary(image_file):
    try:
        result = cloudinary.uploader.upload(image_file)
        return result.get('secure_url')
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
