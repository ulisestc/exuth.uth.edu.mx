from django.db import models
from django.conf import settings
from core.models import Giro, Sector, Carrera
from django.core.validators import RegexValidator, MinLengthValidator
# Create your models here.

class Egresado(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='egresado')
    matricula = models.CharField(max_length=50, unique=True)
    curp = models.CharField(max_length=18, unique=True, validators=[MinLengthValidator(18)])
    cv = models.FileField(upload_to='cvs/', blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name='egresados')

    def __str__(self):
        return f"{self.user.nombres} {self.user.apellido_paterno} {self.user.apellido_materno} - {self.matricula}"
    
class Empresa(models.Model):
    STATUS_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    )
    
    nombre = models.CharField(max_length=255)
    domicilio = models.CharField(max_length=255)
    telefono = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    correo_contacto = models.EmailField()
    actividad_de_la_empresa = models.CharField(max_length=255)
    campo = models.CharField(max_length=255, blank=True, null=True)
    giro = models.ForeignKey(Giro, on_delete=models.PROTECT, related_name='empresas')
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='empresas')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='empresa')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendiente')

    def __str__(self):
        return f"{self.nombre} - {self.correo_contacto}"