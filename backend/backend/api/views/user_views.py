import datetime
import hashlib
import uuid
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from ..models.items_model import Item
from ..models.user_model import User 

@api_view(['POST'])
def signup(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    password = data.get('password')

    # Optional demographics
    date_of_birth = data.get('date_of_birth')
    gender = data.get('gender')
    # location = data.get('location')
    is_student = data.get('is_student', False)
    college = data.get('college')

    if not name or not password or (not email and not phone_number):
        return Response({'error': 'Name, password, and either email or phone number are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    if phone_number and User.objects.filter(phone_number=phone_number).exists():
        return Response({'error': 'Phone number already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    dob_parsed = None
    if date_of_birth:
        try:
            dob_parsed = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date_of_birth format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
    
    embedding_dim = 512
    user = User.objects.create(
        name=name,
        email=email,
        phone_number=phone_number,
        password=make_password(password),
        preference_vector=embed_demographics(date_of_birth, gender,  is_student, college),
        date_of_birth=dob_parsed,
        gender=gender,
        # location=location,
        is_student=is_student,
        college=college
    )

    return Response({
        'message': 'User created successfully',
        'user': {
            'user_id': str(user.user_id),
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'preference_vector': user.preference_vector,
            'rewards':user.rewards
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def complete_signup(request):
    data = request.data
    
    user_id = data.get('user_id')
    name = data.get('name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    password = data.get('password')
    gender = data.get('gender')
    # is_student = data.get('is_student')
    # college = data.get('college')
    date_of_birth = data.get('date_of_birth')

    if not user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Parse date of birth
    dob_parsed = None
    if date_of_birth:
        try:
            dob_parsed = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date_of_birth format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    # Embed demographics
    new_pref_vec = embed_demographics(date_of_birth, gender, is_student, college)

    # Weighted update of preference vector
    existing_vec = user.preference_vector or [0.0] * 512
    updated_vector = [(0.7 * float(e)) + (0.3 * float(n)) for e, n in zip(existing_vec, new_pref_vec)]

    # Update user fields
    user.name = name
    user.email = email
    user.phone_number = phone_number
    if password:
        user.password = make_password(password)
    user.gender = gender
    # user.is_student = is_student
    # user.college = college
    user.date_of_birth = dob_parsed
    user.preference_vector = updated_vector
    user.save()

    return Response({
        'message': 'User updated successfully',
        'user': {
            'user_id': str(user.user_id),
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'preference_vector': user.preference_vector,
            'rewards':user.rewards
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_shadow_user(request):
    # Randomly sample one item from DB with embedding
    item = Item.objects.filter(embedding__isnull=False).order_by('?').first()
    if not item:
        return Response({'error': 'No items with embeddings found.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create shadow user with preference_vector = item's embedding
    user = User.objects.create(
        name="shadow_user_" + str(uuid.uuid4())[:8],
        email=None,
        phone_number=None,
        password=make_password(uuid.uuid4().hex),  # unusable password
        preference_vector=item.embedding,
        is_shadow=True
    )

    return Response({
        'message': 'Shadow user created',
         'user': {
            'user_id': str(user.user_id),
            # 'name': user.name,
            # 'email': user.email,
            # 'phone_number': user.phone_number,
            'preference_vector': user.preference_vector
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    data = request.data
    identifier = data.get('identifier')  # can be email or phone number
    password = data.get('password')
    print(identifier, password)
    if not identifier or not password:
        return Response({'error': 'Identifier and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for email or phone number
    user = User.objects.filter(email=identifier).first() or User.objects.filter(phone_number=identifier).first()

    if not user:
        return Response({'error': 'User not found. Please signup.'}, status=status.HTTP_404_NOT_FOUND)

    if not check_password(password, user.password):
        return Response({'error': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        'message': 'Login successful',
        'user': {
            'user_id': str(user.user_id),
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'preference_vector': user.preference_vector,
            'rewards':user.rewards
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def mark_seen_bulk(request):
    user_id = request.data.get("user_id")
    item_ids = request.data.get("item_ids", [])
    user = User.objects.get(user_id=user_id)

    # Normalize IDs to strings and merge with existing seen items
    seen = set(user.seen_items or [])
    seen.update(str(i) for i in item_ids)

    # Keep most recent 500
    user.seen_items = list(seen)[-500:]
    user.save(update_fields=["seen_items"])

    return Response({"status": "ok", "count": len(item_ids)})


@api_view(['POST'])
def update_rewards(request):
    try:
        user_id = request.data.get("user_id")
        avgdwell=request.data.get("dwell_time")
        avgclicks=request.data.get("clicks")
        isShadow=request.data.get("shadow")
        print(isShadow)
        rewards=0
        score=0
        if(not isShadow):
            score=0.4*avgdwell+0.6*avgclicks
        print(score)
        if(score>2):
            user = User.objects.get(user_id=user_id)
            rewards=user.rewards+2
            user.rewards+=2
            user.save()

        return Response({"new_reward": rewards}, status=201)
    
    except Exception as e:
        # Catch all unexpected errors
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def embed_demographics(age, gender,  is_student, college):
    # Combine demographic info into a single string
    demo_string = f"{age}_{gender}_{is_student}_{college}"
    
    # Hash to create consistent representation
    hash_bytes = hashlib.sha256(demo_string.encode()).digest()
    
    # Use hash to generate a deterministic numpy array
    np.random.seed(int.from_bytes(hash_bytes[:4], 'big'))  # Seed using first 4 bytes
    embedding = np.random.rand(512).tolist()
    
    return embedding


@api_view(['POST'])
def register_fcm_token(request):
    """
    Register or update the FCM token for a user.
    Expected payload:
    {
        "user_id": "<uuid>",
        "token": "<fcm_token_string>"
    }
    """
    try:
        user_id = request.data.get("user_id")
        token = request.data.get("token")

        if not user_id or not token:
            return Response(
                {"error": "Both user_id and token are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(user_id=user_id).first()
        if not user:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # update or create token
        user.fcm_token = token
        user.save(update_fields=["fcm_token", "last_active"])

        return Response(
            {"message": "FCM token saved successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])   # or DELETE if you prefer
def delete_account(request):
    user_id = request.data.get("user_id")

    if not user_id:
        return Response(
            {"error": "user_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        with transaction.atomic():
            # Optional: clear FCM token first
            user.fcm_token = None
            user.save(update_fields=["fcm_token"])

            # HARD DELETE (CASCADE)
            user.delete()

        return Response(
            {"message": "Account deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": "Failed to delete account"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )