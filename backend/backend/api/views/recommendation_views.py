import os
import re
import joblib
import random
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from sklearn.metrics.pairwise import cosine_similarity
from ..models.items_model import Item
from ..models.action_model import Action
from ..models.action_model import User
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "saved_model.pkl")
TRAIN_COUNT_PATH = os.path.join(MODEL_DIR, "train_count.txt")

@api_view(['POST'])
def get_recommendations(request):
    user_id = request.data.get('userid')
    preference_vector = request.data.get('preference_vector')
    min_price = request.data.get('min_price')
    max_price = request.data.get('max_price')
    brands = request.data.get('brands')  # array of strings
    print(brands)
    products = request.data.get('products') 
    min_price = float(min_price) if min_price else None
    max_price = float(max_price) if max_price else None
    try:
        all_items = Item.objects.exclude(embedding=None)
        if brands and all(b and b.lower() != 'none' for b in brands):
            all_items = all_items.filter(store__in=brands)

        # Apply product filter
        if products:
            all_items = all_items.filter(product_category__in=products)
        
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
            model = joblib.load(MODEL_PATH)
            user_vec = np.array(preference_vector)
            # Prepare combined input: [user_vec + item_embedding]
            X = [np.concatenate([user_vec, np.array(item.embedding)]) for item in all_items]
            probs = model.predict_proba(X)[:, 1]  # Like probabilities
            top_indices = np.argsort(probs)[::-1][:17]
            selected_items = [all_items[i] for i in top_indices]
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
        remaining_items = list(set(all_items) - set(selected_items))
        exploration_items = random.sample(remaining_items, min(3, len(remaining_items)))

        final_items = selected_items + exploration_items

        return Response([serialize_item(item) for item in final_items], status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

def serialize_item(item):
    return {
        'item_id': str(item.item_id),
        'title': item.title,
        'store': item.store,
        'price': item.price,
        'image_url': item.image_url,
        'embedding': item.embedding
    }

@api_view(['POST'])
def recalculateuservector(request):
    user_id = request.data.get("user_id")
    user_vector=request.data.get("preference_vector")
    
    if not user_id:
        return Response({"error": "userid is required"}, status=400)

    try:
        # Fetch all liked items by the user
        liked_actions = Action.objects.filter(user=user_id, like_status=True)
     
        if not liked_actions.exists():
            return Response({"error": "No liked items found for user"}, status=404)

        # Collect all item embeddings
        embeddings = [user_vector]
        for action in liked_actions:
            item = action.item
            if item.embedding:
                embeddings.append(item.embedding)

        if not embeddings:
            return Response({"error": "No valid embeddings found for liked items"}, status=404)

        # Compute average
        embedding_array = np.array(embeddings)
        new_user_vector = np.mean(embedding_array, axis=0).tolist()

        # Save updated vector
        User.objects.filter(user_id=user_id).update(preference_vector=new_user_vector)

        return Response({"new_vector": new_user_vector}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)