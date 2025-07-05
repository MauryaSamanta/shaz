import uuid
from django.db import models
from .items_model import Item
from .user_model import User  # adjust the import path as per your project structure

class Cart(models.Model):
    cart_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    items = models.JSONField(default=list)  # List of dicts: [{item_id, quantity}]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)