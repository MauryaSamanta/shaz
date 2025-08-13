from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from ..models.brand_model import Brand
import json

@csrf_exempt
@api_view(['POST'])
def brand_signup(request):
    try:
        data = json.loads(request.body)

        required_fields = ['poc_name', 'email', 'phone', 'password', 'brand_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return JsonResponse({'error': f'{field} is required'}, status=400)

        if Brand.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        brand = Brand.objects.create(
            poc_name=data['poc_name'],
            email=data['email'],
            phone=data['phone'],
            password=make_password(data['password']),
            brand_name=data['brand_name'],
            address=data.get('address', ''),
            store_logo_url=data.get('store_logo_url', ''),
            store_banner_url=data.get('store_banner_url', ''),
            bank_account_number=data.get('bank_account_number', ''),
            ifsc_code=data.get('ifsc_code', ''),
            upi_id=data.get('upi_id', ''),
        )

        brand_data = {
            "id": brand.brand_id,
            "poc_name": brand.poc_name,
            "email": brand.email,
            "phone": brand.phone,
            "brand_name": brand.brand_name,
            "address": brand.address,
            "store_logo_url": brand.store_logo_url,
            "store_banner_url": brand.store_banner_url,
            "bank_account_number": brand.bank_account_number,
            "ifsc_code": brand.ifsc_code,
            "upi_id": brand.upi_id,
            "created_at": brand.created_at.isoformat(),
            "updated_at": brand.updated_at.isoformat()
        }

        return JsonResponse({'message': 'Signup successful', 'brand': brand_data}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
def brand_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)

        try:
            brand = Brand.objects.get(email=email)
        except Brand.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        if not check_password(password, brand.password):
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        return JsonResponse({'message': 'Login successful', 'brand_id': brand.id}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
