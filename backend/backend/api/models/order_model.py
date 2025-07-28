from django.db import models
import uuid

from .items_model import Item

class Order(models.Model):
    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User info
    user_id = models.UUIDField()
    user_name = models.CharField(max_length=255)

    # Items (ManyToMany)
   
    items = models.ManyToManyField(Item, related_name='orders')  

    # Address snapshot (copied at time of order)
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    landmark = models.CharField(max_length=255, null=True, blank=True)

    # Pricing
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id} by {self.user_name}"
