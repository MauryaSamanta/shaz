import uuid
from django.db import models

class Item(models.Model):
    item_id = models.UUIDField(primary_key=True,default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255)
    store = models.CharField(max_length=255)
    price = models.CharField(max_length=255)
    image_url = models.URLField()
    product_category = models.CharField(max_length=100, null=True, blank=True) 
    embedding = models.JSONField(null=True, blank=True)
    