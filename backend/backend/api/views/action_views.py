import os
import sys
from django.shortcuts import get_object_or_404
import numpy as np
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db.models import F, Func, Value
# from model.recommendation_model_v2 import append_interaction_to_log
from ..models.action_model import Action
from ..models.user_model import User
from ..models.items_model import Item
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)
from model.recommendation_model import update_model, upload_model_to_supabase
from drf_spectacular.utils import extend_schema
ERROR_SCHEMA = {
    "type": "object",
    "properties": {
        "error": {"type": "string"}
    }
}

ITEM_SCHEMA = {
    "type": "object",
    "properties": {
        "item_id": {"type": "string"},
        "title": {"type": "string"},
        "store": {"type": "string"},
        "price": {"type": "string"},
        "image_url": {"type": "string"},
        "product_category": {"type": "string"},
        "link": {"type": "string"},
        "embedding": {
            "type": "array",
            "items": {"type": "number"}
        }
    }
}
# @api_view(['POST'])
# def save_action(request):
    # user_id = request.data.get('user_id')
    # item_id = request.data.get('item_id')
    # like_status = request.data.get('like_status')  # True/False
    # item_embedding = request.data.get('item_embedding')  # list[float]
    # current_pref = request.data.get('preference_vector')  # list[float]
      
#     if not user_id or not item_id or item_embedding is None or current_pref is None:
#         return Response({'error': 'Missing required fields'}, status=400)

#     # Create Action (no DB fetch needed)
#     Action.objects.create(
#         user_id=user_id,
#         item_id=item_id,
#         like_status=like_status
#     )

#     # Update preference vector
#     if like_status:
#         new_vector = [u + i for u, i in zip(current_pref, item_embedding)]
#     else:
#         new_vector = [u - i for u, i in zip(current_pref, item_embedding)]

#     # Save directly with update (no ORM fetch)
#     User.objects.filter(user_id=user_id).update(preference_vector=new_vector)

#     return Response({'message': 'Action saved and preference updated', 'new_vector': new_vector}, status=201)
@extend_schema(
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "example": "uuid-user-id"
                },
                "item_id": {
                    "type": "string",
                    "example": "uuid-item-id"
                },
                "like_status": {
                    "type": "boolean",
                    "example": True
                },
                "item_embedding": {
                    "type": "array",
                    "items": {"type": "number"},
                    "example": [0.12, 0.88, 0.44]
                },
                "preference_vector": {
                    "type": "array",
                    "items": {"type": "number"},
                    "example": [0.21, 0.65, 0.91]
                }
            },
            "required": [
                "user_id",
                "item_id",
                "like_status",
                "item_embedding",
                "preference_vector"
            ]
        }
    },
    responses={
        201: {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "example": "Action saved and model updated"
                }
            }
        },
        400: ERROR_SCHEMA,
        500: ERROR_SCHEMA
    }
)
@api_view(['POST'])
def save_action(request):
    user_id = request.data.get('user_id')
    item_id = request.data.get('item_id')
    like_status = request.data.get('like_status')  # True/False
    item_embedding = request.data.get('item_embedding')  # list[float]
    current_pref = request.data.get('preference_vector')
    # print(like_status)
    # Save action to DB
    Action.objects.create(
        user_id=user_id,
        item_id=item_id,
        like_status=like_status
    )

    user = User.objects.get(user_id=user_id)

    seen = user.seen_items or []
    if str(item_id) not in seen:
        seen.append(str(item_id))

    User.objects.filter(user_id=user_id).update(seen_items=seen)
    
    label = 1 if like_status else 0
    update_model(current_pref,item_embedding, label)
    print("updated model")

  
   

    TRAIN_COUNT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model", "train_count.txt")

    try:
        if os.path.exists(TRAIN_COUNT_PATH):
            with open(TRAIN_COUNT_PATH, 'r') as f:
                content = f.read().strip()
                count = int(content) if content else 0  # 🛠️ Handle empty file
        else:
            count = 0

        count += 1
        # if count%5==0:
        #     upload_model_to_supabase()
        with open(TRAIN_COUNT_PATH, 'w') as f:
            f.write(str(count))

    except Exception as e:
        print(f"⚠️ Failed to update training count: {e}")


    return Response({'message': 'Action saved and model updated'}, status=201)
@extend_schema(
    responses={
        200: {
            "type": "array",
            "items": ITEM_SCHEMA
        },
        404: {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "example": "No liked items found for this user."
                }
            }
        },
        500: ERROR_SCHEMA
    }
)
@api_view(['GET'])
def get_liked_items(request, user_id):
    
    liked_actions = Action.objects.filter(user_id=user_id, like_status=True).select_related('item').distinct('item_id')

    if not liked_actions.exists():
        return Response({"message": "No liked items found for this user."}, status=status.HTTP_404_NOT_FOUND)

    data = []
    for action in liked_actions:
        item = action.item
        data.append({
                "item_id": str(item.item_id),
                "title": item.title,
                "store": item.store,
                "price": item.price,
                "image_url": item.image_url,
                "product_category": item.product_category,
                "embedding": item.embedding,
                "link":item.product_link
            
        })

    return Response(data, status=status.HTTP_200_OK)

