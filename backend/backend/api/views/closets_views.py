import traceback
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models.closets_model import Closet
from ..models.user_model import User
from ..models.items_model import Item
from ..models.action_model import Action
from model.recommendation_model import update_model
@api_view(['POST'])
def create_closet(request):
    try:
        user_id = request.data.get('user_id')
        name = request.data.get('name')

        user = get_object_or_404(User, user_id=user_id)

        closet = Closet.objects.create(name=name)
        closet.users.add(user)

        return Response({
            "closet_id": str(closet.closet_id),
            "user_id": str(user.user_id),
            "name": closet.name,
            "items": []
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_user_closets(request, user_id):
    try:
        user = get_object_or_404(User, user_id=user_id)
        closets = Closet.objects.filter(users=user)

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
                } for item in items]
            })

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_item_to_closets(request):
    print("Incoming method:", request.method)
    try:
        closet_ids = request.data.get('closet_ids', [])
        item_id = request.data.get('item_id')
        preference_vector = request.data.get('preference_vector')

        if not closet_ids or not isinstance(closet_ids, list):
            return Response({"error": "closet_ids must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, item_id=item_id)
        
        for cid in closet_ids:
            closet = get_object_or_404(Closet, closet_id=cid)
            
            # add item once
            closet.items.add(item)

            # log action for every collaborator in that closet
            for collaborator in closet.users.all():
                Action.objects.create(
                    user_id=collaborator.user_id,
                    item_id=item_id,
                    like_status="1.5"
                )
                update_model(preference_vector, item.embedding, 1.5)

        return Response(
            {"message": f"Item added to {len(closet_ids)} closet(s) and synced for all collaborators"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
def add_collaborator(request):
    """
    Add a collaborator (user_id) to an existing closet and return full closet data.
    If the user is already a member, do not add again.
    """
    try:
        closet_id = request.data.get('closet_id')
        user_id = request.data.get('user_id')
        # print(closet_id)
        if not closet_id or not user_id:
            return Response({"error": "closet_id and user_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        # fetch both entities
        closet = get_object_or_404(Closet, closet_id=closet_id)
        user = get_object_or_404(User, user_id=user_id)

        # check if user already in closet
        if closet.users.filter(user_id=user.user_id).exists():
            already_member = "True"
        else:
            closet.users.add(user)
            closet.save()
            already_member = "False"

        # fetch all items in this closet
        items = closet.items.all()

        # build closet data (same format as get_user_closets)
        closet_data = {
            "closet_id": str(closet.closet_id),
            "name": closet.name,
            "collaborators": [str(u.user_id) for u in closet.users.all()],
            "items": [
                {
                    "item_id": str(item.item_id),
                    "title": item.title,
                    "image_url": item.image_url,
                    "price": item.price
                }
                for item in items
            ],
            "already_member": already_member  
        }

        return Response(closet_data, status=status.HTTP_200_OK)

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def delete_closet(request):
    """
    Remove a user from a closet's collaborators.
    If this was the last user, delete the closet completely.
    """
    try:
        closet_id = request.data.get('closet_id')
        user_id = request.data.get('user_id')

        if not closet_id or not user_id:
            return Response({"error": "closet_id and user_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        # get the closet and user
        closet = get_object_or_404(Closet, closet_id=closet_id)
        user = get_object_or_404(User, user_id=user_id)

        # if user not in this closet, just return gracefully
        if not closet.users.filter(user_id=user.user_id).exists():
            return Response({"message": "User not a member of this closet"}, status=status.HTTP_200_OK)

        # remove user from collaborators
        closet.users.remove(user)

        # if no collaborators left, delete the closet entirely
        if closet.users.count() == 0:
            closet.delete()
            return Response({
                "message": f"Closet {closet_id} deleted as last user removed."
            }, status=status.HTTP_200_OK)

        # otherwise just confirm removal
        return Response({
            "message": f"User {user_id} removed from closet {closet_id}.",
            "remaining_users": [str(u.user_id) for u in closet.users.all()]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
