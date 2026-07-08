from django.db import models

#acá van todos los modelos de catálogos que se van a usar en el sistema, como giros, sectores, áreas de estudio y carreras.
# Create your models here.
class Giro(models.Model):
    nombre = models.CharField(max_length=150, unique=True)

    class Meta:
        verbose_name = 'Giro'
        verbose_name_plural = 'Giros'

    def __str__(self):
        return self.nombre

class Sector(models.Model):
    nombre = models.CharField(max_length=150, unique=True)

    class Meta:
        verbose_name = 'Sector'
        verbose_name_plural = 'Sectores'

    def __str__(self):
        return self.nombre

class AreaEstudio(models.Model):
    nombre = models.CharField(max_length=150, unique=True)

    class Meta:
        verbose_name = 'Área de Estudio'
        verbose_name_plural = 'Áreas de Estudio'

    def __str__(self):
        return self.nombre
    
class Carrera(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    abreviatura = models.CharField(max_length=20, blank=True, null=True)
    area = models.ForeignKey(AreaEstudio, on_delete=models.PROTECT, related_name='carreras')

    class Meta:
        verbose_name = 'Carrera'
        verbose_name_plural = 'Carreras'

    def __str__(self):
        return self.nombre
    
class Idioma(models.Model):
    nombre = models.CharField(max_length=150, unique=True)

    class Meta:
        verbose_name = 'Idioma'
        verbose_name_plural = 'Idiomas'

    def __str__(self):
        return self.nombre