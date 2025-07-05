import uuid
from django.db import models
from .items_model import Item
from .user_model import User  # adjust the import path if needed

class Closet(models.Model):
    closet_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # Closet name
    items = models.ManyToManyField(Item, related_name='closets')  # Array of item_ids

  