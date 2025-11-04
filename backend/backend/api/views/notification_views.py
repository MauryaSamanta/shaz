import requests
from decouple import config
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models.user_model import User

FCM_SERVER_KEY = config("FCM_SERVER_KEY")

@api_view(['POST'])
def send_push(request):
    title = request.data.get('title')
    body = request.data.get('body')
    data = request.data.get('data', {})
    tokens = request.data.get('tokens', [])

    if not tokens:
        tokens = list(User.objects.exclude(fcm_token=None).values_list('fcm_token', flat=True))

    if not tokens:
        return Response({"error": "No FCM tokens found"}, status=status.HTTP_404_NOT_FOUND)

    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "registration_ids": tokens,
        "notification": {"title": title, "body": body},
        "data": data,
        "priority": "high",
    }

    response = requests.post("https://fcm.googleapis.com/fcm/send", json=payload, headers=headers)
    return Response(response.json(), status=response.status_code)
