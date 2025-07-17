# views.py
import hashlib
import hmac
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import razorpay
import os
from decouple import config
RAZORPAY_KEY_ID = config('RAZORPAY_ID')
RAZORPAY_KEY_SECRET = config('RAZORPAY_SECRET')

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@api_view(['POST'])
def create_order(request):
    try:
        amount =  request.data.get('amount') # in paise

        order_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': f'receipt_{amount}',
            'payment_capture': 1,
        }

        order = client.order.create(data=order_data)

        return Response({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'razorpay_key_id': RAZORPAY_KEY_ID
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_payment(request):
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
            bytes(msg, 'utf-8'),
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(generated_signature, razorpay_signature):
            # ✅ Payment verified, update DB if needed
            return Response({'status': 'success'})
        else:
            return Response({'status': 'failed', 'reason': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])    
def razorpay_checkout(request):
    return render(request, "checkout.html")