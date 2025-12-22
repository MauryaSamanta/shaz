import uuid
from django.db import models
from .items_model import Item


class ItemVariant(models.Model):
    variant_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="variants")

    size = models.CharField(max_length=50, blank=True, null=True)
 

    price = models.CharField(max_length=255, blank=True, null=True)
    stock_quant = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.item.title} - {self.color or ''} {self.size or ''}"
