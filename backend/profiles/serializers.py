import os
from rest_framework import serializers
from .models import Egresado, DocumentoEgresado, Empresa, PadronEgresado


class DocumentoEgresadoSerializer(serializers.ModelSerializer):
    archivo_nombre = serializers.SerializerMethodField()

    class Meta:
        model = DocumentoEgresado
        fields = ['id', 'nombre', 'archivo', 'archivo_nombre', 'fecha_subida']
        read_only_fields = ['id', 'fecha_subida']

    def get_archivo_nombre(self, obj):
        if obj.archivo:
            return os.path.basename(obj.archivo.name)
        return ''


class EgresadoSerializer(serializers.ModelSerializer):
    documentos_precargados = DocumentoEgresadoSerializer(many=True, read_only=True)

    class Meta:
        model = Egresado
        fields = [
            'id', 'user', 'matricula', 'curp', 'cv', 'carrera',
            'telefono_celular', 'telefono_casa', 'domicilio',
            'nivel_estudios', 'genero', 'capacidades_especiales',
            'habilidades', 'documentos_precargados',
            'colocado', 'es_verificado_padron'
        ]
        read_only_fields = ['id', 'user', 'colocado', 'es_verificado_padron', 'documentos_precargados']

    def to_representation(self, instance):
        # 1. Obtiene el diccionario original (donde 'carrera' es un número)
        representation = super().to_representation(instance)
        # 2. Sobrescribe ese número con el nombre real de la carrera e incluye metadatos del usuario
        representation['carrera_id'] = instance.carrera_id
        representation['carrera'] = instance.carrera.nombre
        if instance.user_id and hasattr(instance, 'user'):
            representation['nombres'] = instance.user.nombres
            representation['apellido_paterno'] = instance.user.apellido_paterno
            representation['apellido_materno'] = instance.user.apellido_materno
            representation['nombre_completo'] = (
                f"{instance.user.nombres} {instance.user.apellido_paterno} {instance.user.apellido_materno}".strip()
            )
            representation['email'] = instance.user.email
            representation['fecha_registro'] = (
                instance.user.date_joined.isoformat() if instance.user.date_joined else None
            )
        return representation


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            'id', 'user', 'nombre', 'domicilio', 'correo_contacto',
            'actividad_de_la_empresa', 'campo', 'giro', 'sector', 'status',
            'telefono_oficina', 'telefono_celular', 'nombre_contacto', 'cargo_contacto',
            'logo'
        ]
        read_only_fields = ['id', 'status', 'user']  # El 'id' y 'status' son de solo lectura, y 'user' se asignará automáticamente al usuario autenticado.

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Traducimos las llaves foráneas de catálogos
        representation['giro'] = instance.giro.nombre
        representation['sector'] = instance.sector.nombre
        return representation
    
class EmpresaStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['status', 'id']
        read_only_fields = ['id']  # Solo se puede actualizar el status, no el id

class PadronEgresadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PadronEgresado
        fields = '__all__'
        read_only_fields = ['id', 'fecha_importacion']