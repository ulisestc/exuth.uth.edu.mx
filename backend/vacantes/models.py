from django.db import models
from core.models import Giro, Sector, AreaEstudio, Carrera, Idioma
from profiles.models import Empresa
# Create your models here.

class Vacante(models.Model):
    NIVELES_ESTUDIOS = (
        ('Licenciatura', 'Licenciatura'),
        ('Maestría', 'Maestría'),
        ('Doctorado', 'Doctorado'),
    )
    TRANSPORTE_CHOICES = (
        ('Transporte público', 'Transporte público'),
        ('Transporte privado', 'Transporte privado'),
        ('Transporte propio', 'Transporte propio'),
    )
    SEXO_CHOICES = (
        ('Masculino', 'Masculino'),
        ('Femenino', 'Femenino'),
        ('Indistinto', 'Indistinto'),
    )
    ESTADO_CIVIL_CHOICES = (
        ('Soltero', 'Soltero'),
        ('Casado', 'Casado'),
        ('Divorciado', 'Divorciado'),
        ('Viudo', 'Viudo'),
        ('Concubinato', 'Concubinato'),
    )

    titulo = models.CharField(max_length=150)
    nivel_estudios = models.CharField(max_length=20, choices=NIVELES_ESTUDIOS)
    edad_minima = models.PositiveIntegerField()
    edad_maxima = models.PositiveIntegerField()
    sexo = models.CharField(max_length=10, choices=SEXO_CHOICES)
    estado_civil = models.CharField(max_length=20, choices=ESTADO_CIVIL_CHOICES)
    experiencia = models.TextField()
    otros_conocimientos = models.TextField(blank=True, null=True)
    funciones_y_actividades = models.TextField()
    habilidades_y_competencias = models.TextField()
    transporte = models.CharField(max_length=20, choices=TRANSPORTE_CHOICES)
    oferta_laboral = models.TextField()
    sueldo_minimo = models.DecimalField(max_digits=10, decimal_places=2)
    sueldo_maximo = models.DecimalField(max_digits=10, decimal_places=2)
    horario = models.JSONField()
    entrevistador = models.CharField(max_length=150)
    observaciones = models.TextField(blank=True, null=True)
    confidencial = models.BooleanField(default=False)
    area_estudio = models.ForeignKey(AreaEstudio, on_delete=models.PROTECT, related_name='vacantes')
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='vacantes')
    idiomas = models.ManyToManyField(Idioma, related_name='vacantes', blank=True, through='RequisitoIdioma')

class RequisitoIdioma(models.Model):
    NIVELES_IDIOMA = (
        ('Básico', 'Básico'),
        ('Intermedio', 'Intermedio'),
        ('Avanzado', 'Avanzado'),
    )
    vacante = models.ForeignKey(Vacante, on_delete=models.CASCADE)
    idioma = models.ForeignKey(Idioma, on_delete=models.CASCADE)
    nivel = models.CharField(max_length=50, choices=NIVELES_IDIOMA)
    obligatorio = models.BooleanField(default=False)