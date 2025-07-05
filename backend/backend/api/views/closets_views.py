from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models.closets_model import Closet
from ..models.user_model import User
from ..models.items_model import Item


@api_view(['POST'])
def create_closet(request):
    try:
        user_id = request.data.get('user_id')
        name = request.data.get('name')
        # print(user_id, name)

        user = get_object_or_404(User, user_id=user_id)  # use correct field here

        closet = Closet.objects.create(user=user, name=name)

        return Response({
            "closet_id": str(closet.closet_id),
            "user_id": str(user.user_id),
            "name": closet.name,
            "items": []
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_closets(request, user_id):
    try:
        user = get_object_or_404(User, user_id=user_id)
        closets = Closet.objects.filter(user=user)
        print(closets)
        result = []
        for closet in closets:
            items = closet.items.all()
            result.append({
                "closet_id": str(closet.closet_id),
                "name": closet.name,
                "items": [{
                    "item_id": str(item.item_id),
                    "title": item.title,
                    "image_url": item.image_url,
                    "price": item.price
                    # add more item fields if needed
                } for item in items]
            })

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_item_to_closets(request):
    print("Incoming method:", request.method)

    try:
        closet_ids = request.data.get('closet_ids', [])
        item_id = request.data.get('item_id')

        if not closet_ids or not isinstance(closet_ids, list):
            return Response({"error": "closet_ids must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, item_id=item_id)

        for cid in closet_ids:
            closet = get_object_or_404(Closet, closet_id=cid)
            closet.items.add(item)

        return Response({"message": f"Item added to {len(closet_ids)} closet(s)"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
