from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone

# Create your models here.

#Creamos el manager personalizado
class CustomUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email: 
            raise ValueError("No has ingresado un correo válido")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user
    
    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_deactivated', False)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)
    
#MODELO USER
class User (AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin_uth', 'Administrador UTH'),
        ('egresado', 'Egresado'),
        ('empresa', 'Empresa')
    )
    
    email = models.EmailField(blank=True, default='', unique=True)
    nombres = models.CharField(max_length=255, blank=True, default='')
    apellido_paterno = models.CharField(max_length=255, blank=True, default='')
    apellido_materno = models.CharField(max_length=255, blank=True, default='')
    rol = models.CharField(max_length=255, choices=ROLE_CHOICES, default='egresado')

    is_active = models.BooleanField(default=False)
    is_deactivated = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    # #usar USERNAME_FIELD = 'email'! para indicar a simplejwt que el username es el email
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def get_full_name(self):
        return self.nombres + " " + self.apellido_paterno + " " + self.apellido_materno
    
    def get_short_name(self):
        return self.nombres or self.email.split('@')[0]