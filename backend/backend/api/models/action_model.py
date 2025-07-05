import uuid
from django.db import models
from .items_model import Item
from .user_model import User  # adjust the import path as per your project structure

class Action(models.Model):
    like_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    like_status = models.CharField(max_length=255)
    liked_at = models.DateTimeField(auto_now_add=True)
