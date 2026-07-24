from django.db import models
from django.conf import settings
from core.models import Giro, Sector, Carrera
from django.core.validators import RegexValidator, MinLengthValidator
# Create your models here.

class Egresado(models.Model):
    NIVEL_ESTUDIOS_CHOICES = [
        ('TSU', 'Técnico Superior Universitario'),
        ('ING_LIC', 'Ingeniería / Licenciatura'),
        ('MTRIA', 'Maestría'),
    ]
    
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='egresado')
    matricula = models.CharField(max_length=50, unique=True)
    curp = models.CharField(max_length=18, unique=True, validators=[MinLengthValidator(18)])
    cv = models.FileField(upload_to='files/cvs', blank=True, null=True)
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name='egresados')
    telefono_celular = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    telefono_casa = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    domicilio = models.TextField(verbose_name="Domicilio Completo")
    nivel_estudios = models.CharField(max_length=10, choices=NIVEL_ESTUDIOS_CHOICES, default='ING_LIC')
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES)
    capacidades_especiales = models.TextField(blank=True, null=True, verbose_name="Capacidades Especiales o Discapacidad")
    habilidades = models.TextField(verbose_name="Habilidades Técnicas y Blandas")
    documentos = models.FileField(upload_to='files/docs', blank=True, null=True)
    colocado = models.BooleanField(default=False, verbose_name="¿Egresado Colocado?")
    es_verificado_padron = models.BooleanField(default=False, verbose_name="Verificado contra padrón UTH")

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
    telefono_oficina = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    telefono_celular = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    correo_contacto = models.EmailField()
    actividad_de_la_empresa = models.CharField(max_length=255)
    campo = models.CharField(max_length=255, blank=True, null=True)
    giro = models.ForeignKey(Giro, on_delete=models.PROTECT, related_name='empresas')
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='empresas')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='empresa')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendiente')
    nombre_contacto = models.CharField(max_length=150, verbose_name="Nombre del contacto")
    cargo_contacto = models.CharField(max_length=100, verbose_name="Cargo del Contacto")

    def __str__(self):
        return f"{self.nombre} - {self.correo_contacto}"