from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import ActivationSerializer
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

from profiles.models import Egresado, Empresa, PadronEgresado
from core.models import Carrera, Giro, Sector

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    # Campos opcionales para creación atómica de Egresado
    matricula = serializers.CharField(required=False, write_only=True, allow_blank=True)
    curp = serializers.CharField(required=False, write_only=True, allow_blank=True)
    carrera = serializers.PrimaryKeyRelatedField(queryset=Carrera.objects.all(), required=False, write_only=True, allow_null=True)
    nivel_estudios = serializers.CharField(required=False, write_only=True, allow_blank=True)
    genero = serializers.CharField(required=False, write_only=True, allow_blank=True)
    telefono_celular = serializers.CharField(required=False, write_only=True, allow_blank=True)
    domicilio = serializers.CharField(required=False, write_only=True, allow_blank=True)
    habilidades = serializers.CharField(required=False, write_only=True, allow_blank=True)

    # Campos opcionales para creación atómica de Empresa
    nombre = serializers.CharField(required=False, write_only=True, allow_blank=True)
    nombre_empresa = serializers.CharField(required=False, write_only=True, allow_blank=True)
    correo_contacto = serializers.EmailField(required=False, write_only=True, allow_blank=True)
    actividad_de_la_empresa = serializers.CharField(required=False, write_only=True, allow_blank=True)
    giro = serializers.PrimaryKeyRelatedField(queryset=Giro.objects.all(), required=False, write_only=True, allow_null=True)
    sector = serializers.PrimaryKeyRelatedField(queryset=Sector.objects.all(), required=False, write_only=True, allow_null=True)
    nombre_contacto = serializers.CharField(required=False, write_only=True, allow_blank=True)
    cargo_contacto = serializers.CharField(required=False, write_only=True, allow_blank=True)
    telefono_oficina = serializers.CharField(required=False, write_only=True, allow_blank=True)
    ciudad = serializers.CharField(required=False, write_only=True, allow_blank=True)
    estado = serializers.CharField(required=False, write_only=True, allow_blank=True)

    def validate_rol(self, value):
        """
            Validamos que solo se pueda crear un usuario 'egresado' o 'empresa'
            'admin_uth' solo lo puede crear alguien de SISTEMAS y 'soporte_ti' solo se puede crear
            con superusuario desde consola.
        """
        if value not in ['egresado', 'empresa']:
            raise serializers.ValidationError("Solo se permite crear usuarios con rol 'egresado' o 'empresa'.")
        return value

    def validate(self, attrs):
        # Djoser intenta hacer User(**attrs) para correr password validators.
        # Filtramos únicamente los campos del modelo User para no romper con los campos de perfiles.
        user_field_names = {f.name for f in User._meta.get_fields()}
        user_attrs = {k: v for k, v in attrs.items() if k in user_field_names}
        user = User(**user_attrs)
        password = attrs.get("password")

        from django.contrib.auth.password_validation import validate_password
        from django.core import exceptions as django_exceptions
        from rest_framework.settings import api_settings

        try:
            validate_password(password, user)
        except django_exceptions.ValidationError as e:
            serializer_error = serializers.as_serializer_error(e)
            raise serializers.ValidationError(
                {"password": serializer_error[api_settings.NON_FIELD_ERRORS_KEY]}
            )

        rol = attrs.get('rol')

        if rol == 'egresado':
            matricula = attrs.get('matricula')
            curp = attrs.get('curp')
            if matricula:
                matricula = matricula.strip()
                if Egresado.objects.filter(matricula__iexact=matricula).exists():
                    raise serializers.ValidationError({"matricula": "Esta matrícula ya cuenta con un perfil de egresado registrado."})
            if curp:
                curp = curp.strip().upper()
                if len(curp) != 18:
                    raise serializers.ValidationError({"curp": "La CURP debe tener exactamente 18 caracteres alfanuméricos."})
                if Egresado.objects.filter(curp__iexact=curp).exists():
                    raise serializers.ValidationError({"curp": "Esta CURP ya se encuentra vinculada a otro egresado registrado."})

        return attrs
    
    def create(self, validated_data):
        # Extraer campos de perfil de egresado
        egresado_fields = {
            'matricula': validated_data.pop('matricula', None),
            'curp': validated_data.pop('curp', None),
            'carrera': validated_data.pop('carrera', None),
            'nivel_estudios': validated_data.pop('nivel_estudios', 'ING_LIC'),
            'genero': validated_data.pop('genero', 'M'),
            'telefono_celular': validated_data.pop('telefono_celular', None),
            'domicilio': validated_data.pop('domicilio', None),
            'habilidades': validated_data.pop('habilidades', None),
        }

        # Extraer campos de perfil de empresa
        nombre_emp = validated_data.pop('nombre', None) or validated_data.pop('nombre_empresa', None)
        empresa_fields = {
            'nombre': nombre_emp,
            'domicilio': egresado_fields['domicilio'] or 'Domicilio Corporativo Registrado',
            'correo_contacto': validated_data.pop('correo_contacto', None),
            'actividad_de_la_empresa': validated_data.pop('actividad_de_la_empresa', None),
            'giro': validated_data.pop('giro', None),
            'sector': validated_data.pop('sector', None),
            'nombre_contacto': validated_data.pop('nombre_contacto', None),
            'cargo_contacto': validated_data.pop('cargo_contacto', None),
            'telefono_oficina': validated_data.pop('telefono_oficina', None),
            'telefono_celular': egresado_fields['telefono_celular'],
            'ciudad': validated_data.pop('ciudad', ''),
            'estado': validated_data.pop('estado', 'Puebla'),
        }

        if validated_data.get('acepta_aviso_privacidad'):
            validated_data['fecha_aviso_privacidad'] = timezone.now()

        with transaction.atomic():
            user = super().create(validated_data)

            if user.rol == 'egresado' and egresado_fields.get('matricula'):
                mat = egresado_fields['matricula'].strip()
                curp = (egresado_fields.get('curp') or '').strip().upper()
                carrera = egresado_fields.get('carrera') or Carrera.objects.first()

                es_verificado = PadronEgresado.objects.filter(matricula__iexact=mat).exists()

                raw_tel = egresado_fields.get('telefono_celular') or ''
                clean_tel = re.sub(r'\D', '', raw_tel)
                if not (9 <= len(clean_tel) <= 15):
                    clean_tel = '0000000000'

                Egresado.objects.create(
                    user=user,
                    matricula=mat,
                    curp=curp,
                    carrera=carrera,
                    nivel_estudios=egresado_fields.get('nivel_estudios') or 'ING_LIC',
                    genero=egresado_fields.get('genero') or 'M',
                    telefono_celular=clean_tel,
                    domicilio=egresado_fields.get('domicilio') or 'Domicilio registrado UTH',
                    habilidades=egresado_fields.get('habilidades') or 'Competencias profesionales UTH',
                    es_verificado_padron=es_verificado,
                )

            elif user.rol == 'empresa' and empresa_fields.get('nombre'):
                nombre = empresa_fields['nombre'].strip()
                correo = empresa_fields.get('correo_contacto') or user.email
                giro = empresa_fields.get('giro') or Giro.objects.first()
                sector = empresa_fields.get('sector') or Sector.objects.first()

                raw_tel_of = empresa_fields.get('telefono_oficina') or ''
                clean_tel_of = re.sub(r'\D', '', raw_tel_of) if raw_tel_of else None
                if clean_tel_of and not (9 <= len(clean_tel_of) <= 15):
                    clean_tel_of = None

                raw_tel_cel = empresa_fields.get('telefono_celular') or ''
                clean_tel_cel = re.sub(r'\D', '', raw_tel_cel) if raw_tel_cel else None
                if clean_tel_cel and not (9 <= len(clean_tel_cel) <= 15):
                    clean_tel_cel = None

                Empresa.objects.create(
                    user=user,
                    nombre=nombre,
                    domicilio=empresa_fields.get('domicilio') or 'Domicilio Corporativo Registrado',
                    correo_contacto=correo,
                    actividad_de_la_empresa=empresa_fields.get('actividad_de_la_empresa') or 'Actividad Empresarial',
                    giro=giro,
                    sector=sector,
                    status='aprobada',
                    nombre_contacto=empresa_fields.get('nombre_contacto') or f"{user.nombres} {user.apellido_paterno}".strip(),
                    cargo_contacto=empresa_fields.get('cargo_contacto') or 'Contacto Institucional',
                    telefono_oficina=clean_tel_of,
                    telefono_celular=clean_tel_cel,
                    ciudad=(empresa_fields.get('ciudad') or '').strip(),
                    estado=(empresa_fields.get('estado') or 'Puebla').strip() or 'Puebla',
                )

            return user

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = (
            'id', 'email', 'password', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'acepta_aviso_privacidad',
            'is_active',
            'matricula', 'curp', 'carrera', 'nivel_estudios', 'genero', 'telefono_celular', 'domicilio', 'habilidades',
            'nombre', 'nombre_empresa', 'correo_contacto', 'actividad_de_la_empresa', 'giro', 'sector',
            'nombre_contacto', 'cargo_contacto', 'telefono_oficina', 'ciudad', 'estado',
        )
        read_only_fields = ('is_active',)

class CustomUserSerializer(BaseUserSerializer):
    """Serializer para editar el propio usuario /users/me/"""
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active', 'deactivated_at', 'date_joined', 'last_login', 'acepta_aviso_privacidad', 'fecha_aviso_privacidad')
        read_only_fields = ('id', 'email', 'rol', 'is_active', 'deactivated_at', 'date_joined', 'last_login', 'acepta_aviso_privacidad', 'fecha_aviso_privacidad')

from rest_framework.exceptions import APIException


class CuentaInactivaLoginError(APIException):
    status_code = 403
    default_code = 'cuenta_inactiva'


# Serializador custom para bloquear login de cuentas inactivas mostrando motivo específico (colocación o inactividad)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        from datetime import timedelta
        from django.conf import settings

        email = (attrs.get(self.username_field) or '').strip()
        password = attrs.get('password') or ''
        contacto_uth = getattr(settings, 'UTH_BOLSA_CC_EMAIL', 'bolsadetrabajo@uth.edu.mx')

        user = User.objects.select_related('egresado').filter(email__iexact=email).first() if email else None

        # Verificar contraseña primero para nunca revelar el estatus de una cuenta a terceros sin credenciales válidas
        if user and password and user.check_password(password):
            ahora = timezone.now()
            egresado = getattr(user, 'egresado', None) if user.rol == 'egresado' else None

            # Blindaje en tiempo real: si ya venció su periodo de 6 meses y aún no había corrido el cron
            if egresado and egresado.vigencia_hasta and egresado.vigencia_hasta <= ahora:
                if user.is_active or egresado.activo_bolsa:
                    user.is_active = False
                    user.deactivated_at = ahora
                    user.save(update_fields=['is_active', 'deactivated_at'])
                    egresado.activo_bolsa = False
                    egresado.motivo_inactividad = 'vencimiento'
                    egresado.save(update_fields=['activo_bolsa', 'motivo_inactividad'])

            es_inactiva = (
                user.deactivated_at is not None
                or (egresado is not None and (not egresado.activo_bolsa or bool(egresado.motivo_inactividad)))
            )

            if es_inactiva:
                motivo = (
                    (egresado.motivo_inactividad if egresado else None)
                    or ('colocado' if (egresado and egresado.colocado) else 'manual')
                )

                if motivo == 'colocado':
                    raise CuentaInactivaLoginError({
                        'motivo_inactividad': 'colocado',
                        'titulo': '¡Felicitaciones por tu contratación laboral!',
                        'detail': (
                            f'Derivado de tu aceptación en una vacante vinculada por la UTH, tu cuenta se encuentra '
                            f'actualmente inactiva. En caso de requerir reactivar tu acceso al sistema, comunícate '
                            f'con el administrador de Bolsa de Trabajo UTH ({contacto_uth}).'
                        ),
                    })

                if motivo == 'vencimiento':
                    raise CuentaInactivaLoginError({
                        'motivo_inactividad': 'vencimiento',
                        'titulo': 'Cuenta inactiva por conclusión de vigencia (6 meses)',
                        'detail': (
                            f'Tu periodo institucional de 6 meses de vigencia en la Bolsa de Trabajo UTH ha concluido '
                            f'y tu cuenta se encuentra inactiva. Para solicitar su reactivación, comunícate con el '
                            f'administrador de Bolsa de Trabajo UTH ({contacto_uth}).'
                        ),
                    })

                raise CuentaInactivaLoginError({
                    'motivo_inactividad': motivo,
                    'titulo': 'Cuenta inactiva',
                    'detail': (
                        f'Tu cuenta en la Bolsa de Trabajo UTH se encuentra actualmente desactivada. En caso de '
                        f'requerir su reactivación, comunícate con el administrador de Bolsa de Trabajo UTH ({contacto_uth}).'
                    ),
                })

        return super().validate(attrs)
    
class ReactivateRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="Correo electrónico de la cuenta desactivada")

class ReactivateConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(help_text="ID codificado del usuario (provisto en el correo)")
    token = serializers.CharField(help_text="Token de reactivación (provisto en el correo)")

# Serializador personalizado para forzosamente tener que aceptar el aviso de privacidad al activar cuenta
class CustomActivationSerializer(ActivationSerializer): 
    acepta_aviso_privacidad = serializers.BooleanField(required=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if not attrs.get('acepta_aviso_privacidad'):
            raise serializers.ValidationError(
                {"acepta_aviso_privacidad": "Es un requisito legal indispensable aceptar el Aviso de Privacidad para activar tu cuenta."}         
            )

        self.user.acepta_aviso_privacidad = True
        self.user.fecha_aviso_privacidad = timezone.now()
        return attrs