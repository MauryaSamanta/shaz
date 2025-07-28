from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models.items_model import Item
from ..models.order_model import Order
from django.shortcuts import get_object_or_404

@api_view(['POST'])
def create_order_db(request):
    try:
        data = request.data
        user_id = data.get('user_id')
        user_name = data.get('user_name')
        item_ids = data.get('item_ids', [])
        total_amount = data.get('total_amount')

        # Address fields
        address_line = data.get('address_line')
        city = data.get('city')
        state = data.get('state')
        pincode = data.get('pincode')
        landmark = data.get('landmark', None)

        if not all([user_id, user_name, item_ids, total_amount, address_line, city, state, pincode]):
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create order object
        order = Order.objects.create(
            user_id=user_id,
            user_name=user_name,
            total_amount=total_amount,
            address_line=address_line,
            city=city,
            state=state,
            pincode=pincode,
            landmark=landmark
        )

        # Attach items
        for item_id in item_ids:
            item = get_object_or_404(Item, pk=item_id)
            order.items.add(item)

        return Response({'message': 'Order created successfully.', 'order_id': str(order.order_id)}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
    serialized = [
        {
            "order_id": str(order.order_id),
            "user_name": order.user_name,
            "total_amount": str(order.total_amount),
            "items": [item.name for item in order.items.all()],
            "address": f"{order.address_line}, {order.city}, {order.state} - {order.pincode}",
            "landmark": order.landmark,
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ]
    return Response(serialized)

@api_view(['GET'])
def get_all_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serialized = [
        {
            "order_id": str(order.order_id),
            "user_name": order.user_name,
            "total_amount": str(order.total_amount),
            "items": [item.name for item in order.items.all()],
            "address": f"{order.address_line}, {order.city}, {order.state} - {order.pincode}",
            "landmark": order.landmark,
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ]
    return Response(serialized)
