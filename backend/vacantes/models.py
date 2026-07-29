import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import Giro, Sector, AreaEstudio, Carrera, Idioma
from profiles.models import Empresa, Egresado

class Vacante(models.Model):
    # CATÁLOGOS INTERNOS (CHOICES)
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente de Aprobación'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('cerrada', 'Cerrada / Concluida'),
    ]
    
    TIPO_CONTRATACION_CHOICES = [
        ('tiempo_completo', 'Tiempo Completo'),
        ('indeterminado', 'Contrato Indeterminado'),
        ('temporal', 'Temporal / Por Proyecto'),
        ('medio_tiempo', 'Medio Tiempo'),
    ]
    
    MODALIDAD_CHOICES = [
        ('presencial', 'Presencial'),
        ('home_office', 'Home Office (Remoto)'),
        ('hibrido', 'Híbrido'),
    ]

    NIVEL_ESTUDIOS_CHOICES = [
        ('TSU', 'Técnico Superior Universitario'),
        ('ING_LIC', 'Ingeniería / Licenciatura'),
        ('MTRIA', 'Maestría'),
    ]

    GENERO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
        ('indistinto', 'Indistinto'),
    ]

    ESTADO_CIVIL_CHOICES = [
        ('soltero', 'Soltero(a)'),
        ('casado', 'Casado(a)'),
        ('indistinto', 'Indistinto'),
    ]

    # 1. IDENTIFICACIÓN Y RELACIONES PRINCIPALES
    clave_vacante = models.CharField(max_length=30, unique=True, editable=False, verbose_name="Clave de Vacante")
    titulo = models.CharField(max_length=255, verbose_name="Nombre del Puesto")
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='vacantes', verbose_name="Empresa Empleadora")
    area_estudio = models.ForeignKey(AreaEstudio, on_delete=models.PROTECT, related_name='vacantes', verbose_name="Área de Estudio")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pendiente', db_index=True, verbose_name="Estatus")
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")

    # 2. ESPECIFICACIONES DEL PUESTO Y CONDICIONES DE CONTRATACIÓN
    tipo_contratacion = models.CharField(max_length=20, choices=TIPO_CONTRATACION_CHOICES, verbose_name="Tipo de Contratación")
    modalidad = models.CharField(max_length=15, choices=MODALIDAD_CHOICES, verbose_name="Modalidad de la Vacante")
    num_candidatos = models.PositiveIntegerField(default=1, verbose_name="Número de Candidatos(as) a Considerar")
    horario_trabajo = models.TextField(verbose_name="Horario y Días de Trabajo")

    # 3. PERFIL DEMOGRÁFICO Y ACADÉMICO DEL CANDIDATO(A)
    nivel_estudios = models.CharField(max_length=10, choices=NIVEL_ESTUDIOS_CHOICES, default='ING_LIC', verbose_name="Nivel de Estudios")
    edad = models.CharField(max_length=50, default="Indistinto", verbose_name="Edad Rango/Buscada")
    genero = models.CharField(max_length=15, choices=GENERO_CHOICES, default='indistinto', verbose_name="Género")
    estado_civil = models.CharField(max_length=15, choices=ESTADO_CIVIL_CHOICES, default='indistinto', verbose_name="Estado Civil")

    # 4. INCLUSIÓN Y COMPETENCIAS
    es_inclusiva = models.BooleanField(default=False, verbose_name="¿Es vacante inclusiva?")
    capacidades_especiales = models.TextField(blank=True, null=True, verbose_name="Descripción de Capacidades Especiales Consideradas")
    experiencia = models.TextField(verbose_name="Experiencia Previa Requerida")
    conocimientos = models.TextField(verbose_name="Conjunto de Conocimientos (Saberes)")
    habilidades = models.TextField(verbose_name="Habilidades Duras y Blandas")
    actitudes = models.TextField(verbose_name="Actitudes o Valores")
    responsabilidades = models.TextField(verbose_name="Conjunto de Actividades / Responsabilidades del Puesto")

    # 5. COMPENSACIÓN, BENEFICIOS Y DOCUMENTACIÓN
    sueldo_minimo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Sueldo Mínimo (MXN)")
    sueldo_maximo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Sueldo Máximo (MXN)")
    salario_a_tratar = models.BooleanField(default=False, verbose_name="¿Salario a tratar en entrevista?")
    prestaciones = models.TextField(verbose_name="Prestaciones y Beneficios")
    incluye_transporte = models.BooleanField(default=False, verbose_name="¿Incluye Transporte?")
    incluye_comedor = models.BooleanField(default=False, verbose_name="¿Incluye Comedor?")
    documentos_requeridos = models.TextField(verbose_name="Documentos Requeridos (Pasaporte, Visa, Licencia, etc.)")

    # 6. DATOS DE CONTACTO Y OBSERVACIONES
    persona_contacto = models.CharField(max_length=255, verbose_name="Persona de Contacto con la Organización")
    entrevistador = models.CharField(max_length=255, blank=True, null=True, verbose_name="Persona que realizará la entrevista")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones Adicionales")

    def save(self, *args, **kwargs):
        if not self.clave_vacante:
            anio = timezone.now().year
            codigo_unico = secrets.token_hex(3).upper()
            self.clave_vacante = f"UTH-{anio}-VAC-{codigo_unico}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.clave_vacante}] {self.titulo} - {self.empresa.nombre}"
    
class RequisitoIdioma(models.Model):
    NIVELES_MCER = [
        ('A1', 'A1 - Principiante'),
        ('A2', 'A2 - Básico'),
        ('B1', 'B1 - Pre-intermedio'),
        ('B2', 'B2 - Intermedio'),
        ('C1', 'C1 - Intermedio Avanzado'),
        ('C2', 'C2 - Avanzado / Nativo'),
    ]
    
    vacante = models.ForeignKey(Vacante, on_delete=models.CASCADE, related_name='requisitos_idioma')
    idioma = models.ForeignKey(Idioma, on_delete=models.CASCADE)
    nivel = models.CharField(max_length=2, choices=NIVELES_MCER, default='B1')
    obligatorio = models.BooleanField(default=False)

class Postulacion(models.Model):
    ESTADOS_POSTULACION = (
        ('Pendiente', 'Pendiente'),
        ('Aceptada', 'Aceptada'),
        ('Rechazada', 'Rechazada'),
    )
    vacante = models.ForeignKey(Vacante, on_delete=models.CASCADE, related_name='postulaciones')
    egresado = models.ForeignKey('profiles.Egresado', on_delete=models.CASCADE, related_name='postulaciones')
    fecha_postulacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS_POSTULACION, default='Pendiente')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['vacante', 'egresado'], name='unique_postulacion')
        ]
    
    def __str__(self):
        return f"Postulación de {self.egresado} a la vacante {self.vacante}"

class Colocacion(models.Model):
    egresado = models.ForeignKey('profiles.Egresado', on_delete=models.PROTECT, related_name='colocaciones')
    vacante = models.ForeignKey(Vacante, on_delete=models.SET_NULL, null=True, blank=True, related_name='colocados')
    
    # Referencia perezosa 'events.Evento' que evita el import circular
    evento = models.ForeignKey('events.Evento', on_delete=models.SET_NULL, null=True, blank=True, related_name='colocados')
    
    fecha_colocacion = models.DateField(auto_now_add=True, verbose_name="Fecha de Colocación")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Comentarios adicionales")
    registrado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='colocaciones_registradas')

    class Meta:
        verbose_name = "Colocación de Egresado"
        verbose_name_plural = "Colocaciones de Egresados"
        unique_together = ['egresado', 'vacante']

    # actualizar bandera 'colocado' en perfil de egresado al agregar registro de colocación
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.egresado.colocado:
            self.egresado.colocado = True
            self.egresado.save(update_fields=['colocado'])

    def __str__(self):
        puesto = self.vacante.titulo if self.vacante else "Puesto Externo"
        return f"{self.egresado} colocado en: {puesto}"