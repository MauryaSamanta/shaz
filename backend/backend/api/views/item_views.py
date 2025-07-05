import os
from urllib.parse import urlparse
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..models.items_model import Item
from ..utils.embedder import get_image_embedding_from_url  # adjust import if needed

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


