import uuid
from django.db import models

class Brand(models.Model):
    brand_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    # --- Required POC Info at Signup ---
    poc_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    password = models.CharField(max_length=128)  
    brand_name = models.CharField(max_length=100)

    # --- Optional Additional Info ---
    address = models.TextField(blank=True, null=True)
    
    store_logo_url = models.URLField(blank=True, null=True)
    store_banner_url = models.URLField(blank=True, null=True)

    bank_account_number = models.CharField(max_length=30, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    upi_id = models.CharField(max_length=50, blank=True, null=True)

    # --- Meta ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand_name} ({self.email})"
