import uuid
from django.db import models
from .items_model import Item
from .user_model import User

class Closet(models.Model):
    closet_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    users = models.ManyToManyField(User, related_name='closets')  #  multiple collaborators
    name = models.CharField(max_length=255)
    items = models.ManyToManyField(Item, related_name='closets')  # existing M2M unchanged

    def __str__(self):
        return f"{self.name} ({self.closet_id})"
