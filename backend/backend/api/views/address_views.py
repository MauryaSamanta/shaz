from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models.user_model import User
from ..models.address_model import Address

@api_view(['POST'])
def create_address(request):
    try:
        user_id = request.data.get('user_id')
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    address_line = request.data.get('address_line')
    city = request.data.get('city')
    state = request.data.get('state')
    pincode = request.data.get('pincode')
    landmark = request.data.get('landmark', '')
   
    if not all([address_line, city, state, pincode]):
        return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

    address = Address.objects.create(
        user=user,
        address_line=address_line,
        city=city,
        state=state,
        pincode=pincode,
        landmark=landmark,
        # address_type=address_type
    )

    return Response({
        "message": "Address created successfully.",
        "address_id": str(address.address_id),
        "address_line": address.address_line,
        "city": address.city,
        "state": address.state,
        "pincode": address.pincode
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_user_addresses(request, user_id):
    addresses = Address.objects.filter(user_id=user_id)

    serialized = [
        {
            "address_id": str(addr.address_id),
            "address_line": addr.address_line,
            "city": addr.city,
            "state": addr.state,
            "pincode": addr.pincode,
            "landmark": addr.landmark,
            "created_at": addr.created_at.isoformat(),
            "updated_at": addr.updated_at.isoformat()
        }
        for addr in addresses
    ]

    return Response({"addresses": serialized}, status=status.HTTP_200_OK)