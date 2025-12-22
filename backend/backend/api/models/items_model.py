import uuid
from django.db import models

from .brand_model import Brand

class Item(models.Model):
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255)
    store = models.CharField(max_length=255)
    price = models.CharField(max_length=255)
    image_url = models.URLField()                     # main image
    images = models.JSONField(null=True, blank=True)  # array of image URLs
    product_link = models.URLField(null=True, blank=True)  # 🔥 NEW FIELD
    product_category = models.CharField(max_length=100, null=True, blank=True) 
    embedding = models.JSONField(null=True, blank=True)
    brand_id = models.ForeignKey(Brand, on_delete=models.CASCADE, null=True, blank=True)
    stock_quant = models.CharField(max_length=5, null=True, blank=True)

    def __str__(self):
        return self.title
