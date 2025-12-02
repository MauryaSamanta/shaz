import os
from urllib.parse import urlparse
from django.shortcuts import get_object_or_404
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from ..models.brand_model import Brand

from ..utils.embedder import get_image_embedding_from_url
from ..utils.uploader import upload_image_to_cloudinary
from ..models.items_model import Item
# from ..utils.embedder import get_image_embedding_from_url  # adjust import if needed
from babel.numbers import format_currency
@api_view(['POST'])
def upload_zara_items(request):
    base_dir = os.path.join(settings.BASE_DIR, 'extracts', 'zara')
    print(base_dir)

    if not os.path.exists(base_dir):
        return Response({"error": "Zara folder not found."}, status=status.HTTP_400_BAD_REQUEST)

    created_count = 0
    failed_files = []

    for file_name in os.listdir(base_dir):
        if not file_name.endswith('.csv'):
            continue

        file_path = os.path.join(base_dir, file_name)
        store = "Zara"

        try:
            df = pd.read_csv(file_path)

            if df.empty:
                continue

            # Limit to first 30 rows
            for _, row in df.head(40).iterrows():
                title = str(row.get('name', '')).strip()
                price = str(row.get('price', '')).strip()
                image_url = str(row.get('image', '')).strip()

                if not (title and price and image_url):
                    continue

                embedding = get_image_embedding_from_url(image_url)
                if embedding is None:
                    continue

                Item.objects.create(
                    title=title,
                    price=price,
                    store=store,
                    image_url=image_url,
                    embedding=embedding
                )
                created_count += 1

        except Exception as e:
            failed_files.append(f"{file_name} ({str(e)})")

    return Response({
        "message": f"✅ Created {created_count} items (max 30 per CSV)",
        "failed_files": failed_files
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def upload_scraped_items(request):
    base_dir = os.path.join(settings.BASE_DIR, 'extracts', 'souled')

    if not os.path.exists(base_dir):
        return Response({"error": "Souled Store folder not found."}, status=status.HTTP_400_BAD_REQUEST)

    created_count = 0
    failed_files = []

    for file_name in os.listdir(base_dir):
        if not file_name.endswith('.csv'):
            continue

        file_path = os.path.join(base_dir, file_name)

        try:
            df = pd.read_csv(file_path)

            if df.empty:
                continue

            # Limit to first 40 rows
            for _, row in df.iloc[25:].iterrows():
                title = str(row.get("name", "")).strip()
                price = f"₹ {''.join(filter(str.isdigit, row.get('price', '')))}.00"

                img1_url = str(row.get("image2", "")).strip()
                # img2_url = "https:"+str(row.get("image2", "")).strip()
                product_link = str(row.get("link", "")).strip()
                product_category = str(row.get("product_type", "")).strip()
                store = "Souled Store"
   
                if not (title and price and img1_url):
                    continue

                # 1️⃣ Upload both images to Cloudinary
                cloud_img1 = upload_image_to_cloudinary(img1_url)
                # cloud_img2 = upload_image_to_cloudinary(img2_url) if img2_url else None

                if not cloud_img1:
                    print("❌ Skipping due to image1 upload failure")
                    continue

                # print(title, price, img1_url, img2_url, product_link, product_category, store)

                # # 2️⃣ Generate embedding from Cloudinary main image
                embedding = get_image_embedding_from_url(cloud_img1)
                if embedding is None:
                    print("❌ Skipping due to embedding failure")
                    continue

                # # 3️⃣ Save to DB
                Item.objects.create(
                    title=title,
                    price=price,
                    store=store,
                    image_url=cloud_img1,                 # main image
                    images=[cloud_img1],
                    product_link=product_link,
                    product_category=product_category,
                    embedding=embedding,
                )

                created_count += 1

        except Exception as e:
            failed_files.append(f"{file_name} ({str(e)})")

    return Response({
        "message": f"✅ Created {created_count} items (max 40 per CSV)",
        "failed_files": failed_files
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def upload_mns_items(request):
    base_dir = os.path.join(settings.BASE_DIR, 'extracts', 'mns')
    print(base_dir)

    if not os.path.exists(base_dir):
        return Response({"error": "M&S folder not found."}, status=status.HTTP_400_BAD_REQUEST)

    created_count = 0
    failed_files = []

    for file_name in os.listdir(base_dir):
        if not file_name.endswith('.csv'):
            continue

        file_path = os.path.join(base_dir, file_name)
        store = "MnS"

        # Infer product_category from filename
        lower_name = file_name.lower()
        if 'dress' in lower_name:
            product_category = 'dresses'
        elif 'tops' in lower_name:
            product_category = 'tops'
        elif 'shorts' in lower_name:
            product_category = 'shorts'
        else:
            product_category = None  # Optional fallback

        try:
            df = pd.read_csv(file_path)

            if df.empty:
                continue

            for _, row in df.head(40).iterrows():
                title = str(row.get('name', '')).strip()
                price = str(row.get('price', '')).strip()
                image_url = str(row.get('image', '')).strip()

                if not (title and price and image_url):
                    continue

                embedding = get_image_embedding_from_url(image_url)
                if embedding is None:
                    continue

                Item.objects.create(
                    title=title,
                    price=price,
                    store=store,
                    image_url=image_url,
                    product_category=product_category,
                    embedding=embedding
                )
                created_count += 1

        except Exception as e:
            failed_files.append(f"{file_name} ({str(e)})")

    return Response({
        "message": f"✅ Created {created_count} M&S items (max 40 per CSV)",
        "failed_files": failed_files
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def upload_seller_items(request):
    data = request.data
    title = data.get('title')
    price = data.get('price')
    store = data.get('brand_name')
    stock=data.get('stock')
    image = request.FILES.get('image') 
    product_category=data.get('product_category')
    brand_id=data.get('brand_id')
    image_url=upload_image_to_cloudinary(image)
    embedding = get_image_embedding_from_url(image_url)
    brand=  get_object_or_404(Brand, brand_id=brand_id)
    lower_name = product_category
    if 'dress' in lower_name:
        product_category = 'dresses'
    elif 'tops' in lower_name:
        product_category = 'tops'
    elif 'shorts' in lower_name:
        product_category = 'shorts'
    else:
        product_category = None  # Optional fallback
    price = format_currency(price, 'INR', locale='en_IN')
    Item.objects.create(
        title=title,
        price=price,
        store=store,
        image_url=image_url,
        product_category=product_category,
        embedding=embedding,
        stock_quant=stock,
        brand_id=brand
    )
    # # created_count += 1

    

    return Response({
        "message": f"✅ Created ",
        # "failed_files": failed_files
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_all_items(request):
    try:
        items = Item.objects.all().values(
            'item_id', 'title', 'price', 'store', 'image_url', 'embedding'
        )
        return Response(list(items), status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Failed to fetch items: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# views.py
import requests
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def proxy_image(request):
    url = request.GET.get('url')

    if not url:
        return JsonResponse({'error': 'URL parameter is missing'}, status=400)

    try:
        # Determine referer based on domain
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if 'zara.com' in domain:
            referer = "https://www.zara.com/"
        elif 'marksandspencer' in domain or 'mns' in domain or 'marksandspencer.in' in domain:
            referer = "https://www.marksandspencer.in/"
        else:
            referer = f"https://{domain}/"  # fallback

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/91.0.4472.124 Safari/537.36",
            "Referer": referer,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        }

        img = requests.get(url, headers=headers, stream=True)
        img.raise_for_status()
        return HttpResponse(img.content, content_type='image/jpeg')

    except requests.exceptions.RequestException as e:
        print(f"🛑 Error fetching image: {e}")
        return JsonResponse({'error': str(e)}, status=500)


