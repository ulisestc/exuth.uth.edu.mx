from datetime import timedelta
from django.db import models, transaction, IntegrityError
from django.db.models import Max
from django.conf import settings
from django.utils import timezone
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

    MOTIVO_INACTIVIDAD_CHOICES = [
        ('colocado', 'Contratado en Vacante'),
        ('vencimiento', 'Vigencia de 6 Meses Concluida'),
        ('manual', 'Inactivado por Administración UTH'),
        ('acceso_denegado', 'Acceso Denegado'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='egresado')
    folio_bolsa = models.PositiveIntegerField(unique=True, null=True, blank=True, editable=False, verbose_name="Folio Bolsa de Trabajo")
    matricula = models.CharField(max_length=50, unique=True)
    curp = models.CharField(max_length=18, unique=True, validators=[MinLengthValidator(18)])
    cv = models.FileField(upload_to='egresados/cvs/', blank=True, null=True)
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name='egresados')
    telefono_celular = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    telefono_casa = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    domicilio = models.TextField(verbose_name="Domicilio Completo")
    nivel_estudios = models.CharField(max_length=10, choices=NIVEL_ESTUDIOS_CHOICES, default='ING_LIC')
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES)
    capacidades_especiales = models.TextField(blank=True, null=True, verbose_name="Capacidades Especiales o Discapacidad")
    habilidades = models.TextField(verbose_name="Habilidades Técnicas y Blandas")
    colocado = models.BooleanField(default=False, verbose_name="¿Egresado Colocado?")
    es_verificado_padron = models.BooleanField(default=False, verbose_name="Verificado contra padrón UTH")
    activo_bolsa = models.BooleanField(default=True, db_index=True, verbose_name="Activo en Bolsa de Trabajo")
    motivo_inactividad = models.CharField(max_length=20, choices=MOTIVO_INACTIVIDAD_CHOICES, blank=True, null=True, verbose_name="Motivo de Inactividad")
    vigencia_hasta = models.DateTimeField(blank=True, null=True, verbose_name="Vigencia de Cuenta Hasta")
    aviso_vencimiento_enviado = models.BooleanField(default=False, verbose_name="Aviso Preventivo 15 Días Enviado")

    def save(self, *args, **kwargs):
        es_nuevo = self._state.adding and self.pk is None
        if es_nuevo and not self.vigencia_hasta:
            self.vigencia_hasta = timezone.now() + timedelta(days=180)

        if es_nuevo and self.folio_bolsa is None:
            for intento in range(3):
                try:
                    with transaction.atomic():
                        ultimo = Egresado.objects.select_for_update().aggregate(max_folio=Max('folio_bolsa'))['max_folio'] or 0
                        self.folio_bolsa = ultimo + 1
                        return super().save(*args, **kwargs)
                except IntegrityError as exc:
                    if 'folio_bolsa' in str(exc) and intento < 2:
                        self.folio_bolsa = None
                        continue
                    raise

        return super().save(*args, **kwargs)

    def verificar_vigencia(self):
        """Evalúa en tiempo real si concluyó la vigencia de 6 meses; de ser así, bloquea el acceso de la cuenta."""
        ahora = timezone.now()
        if self.activo_bolsa and self.vigencia_hasta and self.vigencia_hasta <= ahora:
            self.activo_bolsa = False
            self.motivo_inactividad = 'vencimiento'
            self.save(update_fields=['activo_bolsa', 'motivo_inactividad'])
            if self.user_id and self.user:
                self.user.is_active = False
                self.user.deactivated_at = ahora
                self.user.save(update_fields=['is_active', 'deactivated_at'])
        return self.activo_bolsa

    def __str__(self):
        return f"{self.user.nombres} {self.user.apellido_paterno} {self.user.apellido_materno} - {self.matricula}"


class DocumentoEgresado(models.Model):
    egresado = models.ForeignKey(Egresado, on_delete=models.CASCADE, related_name='documentos_precargados')
    nombre = models.CharField(max_length=150, verbose_name="Nombre o Tipo de Documento")
    archivo = models.FileField(upload_to='egresados/docs/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Documento Pre-cargado de Egresado"
        verbose_name_plural = "Documentos Pre-cargados de Egresados"
        ordering = ['-fecha_subida', '-id']

    def __str__(self):
        return f"{self.nombre} - {self.egresado.matricula}"
    
class Empresa(models.Model):
    STATUS_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    )
    
    nombre = models.CharField(max_length=255)
    domicilio = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=150, blank=True, default='', verbose_name="Ciudad o Población")
    estado = models.CharField(max_length=100, default='Puebla', verbose_name="Estado")
    telefono_oficina = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    telefono_celular = models.CharField(max_length=15, blank=True, null=True, validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="El número de teléfono debe tener entre 9 y 15 dígitos y puede incluir un prefijo internacional.")])
    correo_contacto = models.EmailField()
    actividad_de_la_empresa = models.CharField(max_length=255)
    campo = models.CharField(max_length=255, blank=True, null=True)
    giro = models.ForeignKey(Giro, on_delete=models.PROTECT, related_name='empresas')
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='empresas')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='empresa')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='aprobada')
    nombre_contacto = models.CharField(max_length=150, verbose_name="Nombre del contacto")
    cargo_contacto = models.CharField(max_length=100, verbose_name="Cargo del Contacto")
    logo = models.ImageField(upload_to='empresas/logos/', blank=True, null=True, verbose_name="Logotipo Corporativo")

    def __str__(self):
        return f"{self.nombre} - {self.correo_contacto}"


class PadronEgresado(models.Model):
    """
    Representa el Padrón Institucional oficial de alumnos y egresados de la UTH,
    importado periódicamente desde los reportes de Servicios Escolares (Excel 78 columnas).
    """
    matricula = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="Matrícula Institucional")
    nombre = models.CharField(max_length=255, verbose_name="Nombre Completo")
    carrera = models.CharField(max_length=255, verbose_name="Carrera")
    periodo = models.CharField(max_length=100, blank=True, null=True, verbose_name="Periodo de Egreso")
    anio_egreso = models.CharField(max_length=10, blank=True, null=True, verbose_name="Año de Egreso")
    estatus_titulacion = models.CharField(max_length=150, blank=True, null=True, verbose_name="Estatus de Titulación")
    estatus_tsu = models.CharField(max_length=150, blank=True, null=True, verbose_name="Estatus TSU")
    etnia_indigena = models.CharField(max_length=100, blank=True, null=True, verbose_name="Etnia Indígena")
    discapacidad = models.CharField(max_length=150, blank=True, null=True, verbose_name="Discapacidad")
    genero = models.CharField(max_length=20, blank=True, null=True, verbose_name="Género")
    nivel = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nivel de Estudios")
    tel_escolares = models.CharField(max_length=255, blank=True, null=True, verbose_name="Teléfono Escolares")
    correo_escolares = models.CharField(max_length=255, blank=True, null=True, verbose_name="Correo Escolares")
    domicilio = models.TextField(blank=True, null=True, verbose_name="Domicilio")
    estado_domicilio = models.CharField(max_length=100, blank=True, null=True, verbose_name="Estado")
    municipio = models.CharField(max_length=150, blank=True, null=True, verbose_name="Municipio")
    curp = models.CharField(max_length=25, blank=True, null=True, verbose_name="CURP")
    fecha_nacimiento = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fecha de Nacimiento")
    trabaja_actualmente = models.CharField(max_length=50, blank=True, null=True, verbose_name="¿Actualmente trabaja?")
    correo_personal = models.CharField(max_length=255, blank=True, null=True, verbose_name="Correo Electrónico Personal")
    telefono_movil = models.CharField(max_length=100, blank=True, null=True, verbose_name="Teléfono Móvil")
    fecha_importacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Importación")

    class Meta:
        verbose_name = "Padrón de Egresado"
        verbose_name_plural = "Padrón de Egresados"
        ordering = ['-fecha_importacion', 'matricula']

    def __str__(self):
        return f"{self.matricula} - {self.nombre} ({self.carrera})"