# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from model.recommendation_model import update_model
from ..models.cart_model import Cart
from ..models.user_model import User
from ..models.items_model import Item
from ..models.action_model import Action
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_cart(request, user_id):
    user = get_object_or_404(User, user_id=user_id)
    cart, _ = Cart.objects.get_or_create(user=user)

    response_items = []
    for entry in cart.items:
        try:
            item = Item.objects.get(item_id=entry['item_id'])
            response_items.append({
                "item_id": str(item.item_id),
                "title": item.title,
                "store": item.store,
                "price": item.price,
                "image_url": item.image_url,
                "quantity": entry.get('quantity', 1)
            })
        except Item.DoesNotExist:
            continue

    return Response({
        "cart_id": str(cart.cart_id),
        "user_id": str(user.user_id),
        "items": response_items
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_to_cart(request):
    user_id = request.data.get('user_id')
    item_id = request.data.get('item_id')
    quantity = int(request.data.get('quantity', 1))

    user = get_object_or_404(User, user_id=user_id)
    item = get_object_or_404(Item, item_id=item_id)
    cart, _ = Cart.objects.get_or_create(user=user)
    Action.objects.create(
        user_id=user_id,
        item_id=item_id,
        like_status="2"
    )
    update_model(user.preference_vector, item.embedding,2)
    updated = False
    for entry in cart.items:
        if entry['item_id'] == str(item_id):
            entry['quantity'] += quantity
            updated = True
            break

    if not updated:
        cart.items.append({'item_id': str(item_id), 'quantity': quantity})
    res = {
    "item_id": str(item.item_id),
    "title": item.title,
    "store": item.store,
    "price": item.price,
    "image_url": item.image_url,
    "quantity": entry['quantity']
}
   
    cart.save()
    return Response({"item":res}, status=status.HTTP_200_OK)

@api_view(['POST'])
def remove_from_cart(request):
    user_id = request.data.get('user_id')
    item_id = request.data.get('item_id')

    user = get_object_or_404(User, user_id=user_id)
    cart = get_object_or_404(Cart, user=user)

    new_items = [entry for entry in cart.items if entry['item_id'] != str(item_id)]
    cart.items = new_items
    cart.save()

    return Response({"message": "Item removed from cart"}, status=status.HTTP_200_OK)
