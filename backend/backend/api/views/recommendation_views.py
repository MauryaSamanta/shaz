import os
import re
import tempfile
import traceback
from django.shortcuts import get_object_or_404
import joblib
import random
import numpy as np
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Count
from ..utils.item_cache import get_all_items_cached
from ..models.items_model import Item
from ..models.action_model import Action
from ..models.action_model import User
from ..models.closets_model import Closet
from ..models.cart_model import Cart
from decouple import config
import logging
logger = logging.getLogger(__name__)
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "saved_model.pkl")
TRAIN_COUNT_PATH = os.path.join(MODEL_DIR, "train_count.txt")
SUPABASE_MODEL=config("SUPABASE_MODEL")
SUPABASE_KEY=config("SUPABASE_KEY")
SUPABASE_BUCKET = config("SUPABASE_BUCKET")
@api_view(['POST'])
def get_recommendations(request):
    user_id = request.data.get('userid')
    preference_vector = request.data.get('preference_vector')
    min_price = request.data.get('min_price')
    max_price = request.data.get('max_price')
    brands = request.data.get('brands')  # array of strings
    
    products = request.data.get('products') 
    print(products)
    min_price = float(min_price) if min_price else None
    max_price = float(max_price) if max_price else None
    try:
        all_items = get_all_items_cached()
        user = User.objects.get(user_id=user_id)
        seen_ids = set(user.seen_items or [])
        print(seen_ids)
        if brands and all(b and b.lower() != 'none' for b in brands):
            all_items = [item for item in all_items if item.store in brands]

        # Apply product filter
        if products:
            all_items = [item for item in all_items if item.product_category in products]

        all_items = [item for item in all_items if str(item.item_id) not in seen_ids]

        
        
        def valid_price(item):
            try:
                # print(max_price)
                cleaned_price = re.sub(r'[^\d.]', '', item.price.replace(',', ''))
                price = float(cleaned_price)

                if min_price and max_price:
                    return float(min_price) <= price <= float(max_price)
                elif min_price:
                    return float(min_price) <= price
                elif max_price:
                    return price <= float(max_price)
                else:
                    return True
            except:
                return False
            
        all_items = list(filter(valid_price, all_items))
        use_model = False
        # model_path=download_model_from_url(SUPABASE_MODEL, save_to_path=MODEL_PATH)
        model_path=MODEL_PATH
        if os.path.exists(MODEL_PATH):
            print("✅ Model file exists")
        else:
            print("❌ Model file missing")

        if os.path.exists(TRAIN_COUNT_PATH):
            print("✅ Train count file exists")
        else:
            print("❌ Train count file missing")
        if os.path.exists(MODEL_PATH) and os.path.exists(TRAIN_COUNT_PATH):
            try:
                with open(TRAIN_COUNT_PATH, 'r') as f:
                    if int(f.read().strip()) >= 10:
                        use_model = True
            except:
                pass
        # # CASE 1: No preference vector or all 0s → cold start fallback
        if not preference_vector or sum(preference_vector) == 0 and use_model==False:
            random_items = random.sample(all_items, min(20, len(all_items)))
            return Response([serialize_item(item) for item in random_items], status=200)

        # CASE 2: Check if model exists and is trained enough
       
        # print(use_model)
        if use_model:
            
            print(model_path)
            model = joblib.load(model_path)
            user_vec = np.array(preference_vector)
            # print(user_vec)
            # Prepare combined input: [user_vec + item_embedding]
            X = [np.concatenate([user_vec, np.array(item.embedding)]) for item in all_items]
            scores = model.predict(X)
            top_indices = np.argsort(scores)[::-1][:15]
            selected_items = [all_items[i] for i in top_indices]
            # print(selected_items)
            print("Used Model")
        else:
            # Fallback to cosine similarity
            vectors = [item.embedding for item in all_items]
            user_vec = np.array(preference_vector).reshape(1, -1)
            item_matrix = np.array(vectors)
            sims = cosine_similarity(user_vec, item_matrix)[0]
            top_indices = sims.argsort()[::-1][:3]
            selected_items = [all_items[i] for i in top_indices]
            print("Used Cosine")

        # Add 3 exploration items
        # remaining_items = list(set(all_items) - set(selected_items))
        # exploration_items = random.sample(remaining_items, min(3, len(remaining_items)))

        final_items = selected_items 
        # + exploration_items
        sent_ids = [str(i.item_id) for i in final_items]
        new_seen = list(set(seen_ids).union(sent_ids))
        if len(new_seen) > 1000:
            new_seen = new_seen[-1000:]

        # Direct DB update (no re-save object)
        User.objects.filter(user_id=user_id).update(seen_items=new_seen)
        return Response([serialize_item(item) for item in final_items], status=200)

    except Exception as e:
        logger.error("Error in get_recommendations", exc_info=True)
        return Response({'error': str(e)}, status=500)

def serialize_item(item):
    # Fetch all variants for this item
    variants = item.variants.all()

    sizes = []
    for v in variants:
        sizes.append({
            "size": v.size,
            "stock_quant": v.stock_quant
        })

    return {
        'item_id': str(item.item_id),
        'title': item.title,
        'store': item.store,
        'price': item.price,
        'image_url': item.image_url,
        'embedding': item.embedding,
        'sizes': sizes,
        'images':item.images,
        'link':item. product_link
    }

@api_view(['POST'])
def recalculateuservector(request):
    user_id = request.data.get("user_id")
    user_vector = request.data.get("preference_vector")

    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    try:
        actions = Action.objects.filter(user=user_id)

        if not actions.exists():
            return Response({"error": "No actions found for user"}, status=404)

        weighted_embeddings = []
        weights = []

        # Include the original user vector as small bias
        if user_vector:
            weighted_embeddings.append(user_vector)
            weights.append(0.5)

        for action in actions:
            item = action.item
            # print(action.like_status)
            like_status=0.0
            if action.like_status!='True' and action.like_status!='False':
                like_status = float(action.like_status)
            
            if item.embedding:
                weighted_embeddings.append(item.embedding)
                weights.append(like_status)  # use the like_status as weight

        if not weighted_embeddings:
            return Response({"error": "No valid embeddings found"}, status=404)

        # Compute weighted average
        embedding_array = np.array(weighted_embeddings)
        weights = np.array(weights).reshape(-1, 1)
        weighted_sum = np.sum(embedding_array * weights, axis=0)
        total_weight = np.sum(weights)
        new_user_vector = (weighted_sum / total_weight).tolist()

        User.objects.filter(user_id=user_id).update(preference_vector=new_user_vector)

        return Response({"new_vector": new_user_vector}, status=201)

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    
    
def download_model_from_url(url, save_to_path=None):
    response = requests.get(url)
    if response.status_code == 200:
        save_path = save_to_path or tempfile.NamedTemporaryFile(delete=False, suffix=".pkl").name
        with open(save_path, "wb") as f:
            f.write(response.content)
        return save_path
    else:
        raise Exception(f"Failed to download model: {response.status_code}")
    
@api_view(['POST'])
def discover_similar(request):
    """
    Recommend new items based on the overall style of items in a closet.
    Works purely on embedding similarity (no compatibility matrix).
    Excludes: items already in the closet + items user has already seen.
    """
    try:
        user_id = request.data.get('user_id')
        closet_id = request.data.get("closet_id")

        if not user_id or not closet_id:
            return Response({"error": "user_id and closet_id are required"}, status=400)

        # ---- 1️⃣ Fetch user and seen items
        user = get_object_or_404(User, user_id=user_id)
        seen_ids = set(user.seen_items or [])

        # ---- 2️⃣ Fetch closet and items
        closet = get_object_or_404(Closet, closet_id=closet_id)
        closet_items = closet.items.exclude(embedding=None)

        if not closet_items.exists():
            return Response({"error": "Closet has no items with embeddings"}, status=404)

        # ---- 3️⃣ Build closet embedding signature (mean of all item embeddings)
        closet_embeddings = [np.array(item.embedding) for item in closet_items]
        closet_vector = np.mean(closet_embeddings, axis=0).reshape(1, -1)

        # ---- 4️⃣ Exclude items already in the closet OR already seen by user
        all_items_qs = (
            Item.objects.exclude(embedding=None)
            .exclude(closets=closet)
            .exclude(item_id__in=seen_ids)
        )
        all_items = list(all_items_qs)  # ✅ Convert QuerySet to list for safe indexing

        if not all_items:
            return Response({"error": "No candidate items found"}, status=404)

        # ---- 5️⃣ Compute cosine similarity between closet vector and all other items
        item_matrix = np.array([i.embedding for i in all_items])
        sims = cosine_similarity(closet_vector, item_matrix)[0]

        # ---- 6️⃣ Rank by similarity score
        sorted_indices = sims.argsort()[::-1]

        # ---- 7️⃣ Diversify categories (avoid showing 15 shirts if closet has many shirts)
        closet_categories = set(i.product_category for i in closet_items if i.product_category)
        selected_items = []
        seen_categories = set()

        for idx in sorted_indices:
            item = all_items[int(idx)]  # ✅ Cast numpy.int64 → int
            category = item.product_category or "misc"

            # Encourage showing new categories
            if category not in closet_categories or len(seen_categories) >= len(closet_categories):
                selected_items.append(item)
                seen_categories.add(category)

            if len(selected_items) >= 15:
                break

        # Fallback: if not enough diverse categories
        if len(selected_items) < 15:
            for idx in sorted_indices:
                item = all_items[int(idx)]
                if item not in selected_items:
                    selected_items.append(item)
                if len(selected_items) >= 15:
                    break

        # ---- 8️⃣ Return serialized response
        return Response([serialize_item(i) for i in selected_items], status=200)

    except Exception as e:
        print("⚠️ Error in discover_similar:", e)
        return Response({"error": str(e)}, status=500)
    

@api_view(["POST"])
def find_duplicate_images(request):
    """
    Removes duplicate items (same store + title) and updates Cart entries
    so no cart contains a deleted item_id.
    """
    try:
        # 1️⃣ Find duplicate groups
        dup_groups = (
            Item.objects.values("store", "title")
            .annotate(count=Count("item_id"))
            .filter(count__gt=1)
        )

        if not dup_groups.exists():
            return Response({"message": "No duplicates found"}, status=200)

        total_deleted = 0
        replacements = []  # for debugging/response

        for entry in dup_groups:
            store = entry["store"]
            title = entry["title"]

            items = list(Item.objects.filter(store=store, title=title).order_by("item_id"))

            # Pick the FIRST item as the primary
            primary_item = items[0]
            primary_id = str(primary_item.item_id)

            duplicates_to_delete = items[1:]  # all except the first

            duplicate_ids = [str(i.item_id) for i in duplicates_to_delete]

            # 2️⃣ Update all carts: replace duplicate item_ids with primary item_id
            carts = Cart.objects.all()
            for cart in carts:
                changed = False
                new_items = []

                for entry in cart.items:
                    iid = entry.get("item_id")
                    qty = entry.get("quantity", 1)

                    # If the cart has a duplicate item → replace with primary
                    if iid in duplicate_ids:
                        new_items.append({
                            "item_id": primary_id,
                            "quantity": qty
                        })
                        changed = True
                    else:
                        new_items.append(entry)

                if changed:
                    cart.items = new_items
                    cart.save()

            # 3️⃣ Delete the duplicate items
            for dup in duplicates_to_delete:
                dup.delete()
                total_deleted += 1

            replacements.append({
                "store": store,
                "title": title,
                "kept": primary_id,
                "deleted": duplicate_ids
            })

        return Response({
            "message": "Duplicate cleanup complete",
            "total_deleted": total_deleted,
            "details": replacements,
        }, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)