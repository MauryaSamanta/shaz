from django.db import models
import uuid

class Address(models.Model):
    address_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='addresses')

    # Address fields
    address_line = models.TextField()  # Main content of the address (e.g., house no, street, area)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    # Optional fields
    landmark = models.CharField(max_length=255, null=True, blank=True)
  

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.address_line}, {self.city} - {self.pincode}"
