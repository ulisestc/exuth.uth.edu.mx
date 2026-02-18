from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser (AbstractUser):
    #usar USERNAME_FIELD = 'email'! para indicar a simplejwt que el username es el email
    pass