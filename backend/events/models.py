from django.db import models

class Evento(models.Model):
    TIPOS_EVENTO = [
        ('feria_empleo', 'Feria de Empleo'),
        ('reclutamiento_masivo', 'Reclutamiento Masivo'),
        ('taller', 'Taller'),
        ('conferencia', 'Conferencia'),
        ('otro', 'Otro'),
    ]

    nombre = models.CharField(max_length=150, verbose_name="Nombre del Evento")
    tipo_evento = models.CharField(max_length=50, choices=TIPOS_EVENTO, verbose_name="Tipo de Evento")
    
    fecha_inicio = models.DateTimeField(verbose_name="Fecha y Hora de Inicio")
    fecha_fin = models.DateTimeField(verbose_name="Fecha y Hora de Término")
    
    lugar = models.CharField(max_length=200, verbose_name="Lugar o Enlace Virtual")
    descripcion = models.TextField(verbose_name="Descripción del Evento")
    
    is_active = models.BooleanField(default=True, verbose_name="¿Evento Activo?")

    class Meta:
        verbose_name = "Evento de Empleabilidad"
        verbose_name_plural = "Eventos de Empleabilidad"
        ordering = ['-fecha_inicio']  # Los más recientes o próximos primero

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_evento_display()})"