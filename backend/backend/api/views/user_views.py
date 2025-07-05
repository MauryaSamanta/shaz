import datetime
import hashlib
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
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
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not check_password(password, user.password):
        return Response({'error': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        'message': 'Login successful',
        'user': {
            'user_id': str(user.user_id),
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'preference_vector': user.preference_vector
        }
    }, status=status.HTTP_200_OK)

def embed_demographics(age, gender,  is_student, college):
    # Combine demographic info into a single string
    demo_string = f"{age}_{gender}_{is_student}_{college}"
    
    # Hash to create consistent representation
    hash_bytes = hashlib.sha256(demo_string.encode()).digest()
    
    # Use hash to generate a deterministic numpy array
    np.random.seed(int.from_bytes(hash_bytes[:4], 'big'))  # Seed using first 4 bytes
    embedding = np.random.rand(512).tolist()
    
    return embedding