import uuid
from django.db import models

class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, null=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)  
    password = models.CharField(max_length=255)
    preference_vector = models.JSONField(null=True, blank=True)

    # Demographics
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
   
    is_student =  models.CharField(max_length=10, null=True, blank=True)
   
    college = models.CharField(max_length=255, null=True, blank=True)

    # Engagement
    joined_on = models.DateTimeField(auto_now_add=True, null=True)
    last_active = models.DateTimeField(auto_now=True, null=True)
    session_count = models.IntegerField(default=0)
    total_swipes = models.IntegerField(default=0)
    total_likes = models.IntegerField(default=0)
    rewards = models.IntegerField(default=0)

    #seen items list
    seen_items = models.JSONField(default=list, blank=True)

    #shadow state of user
    is_shadow = models.BooleanField(default=False)

