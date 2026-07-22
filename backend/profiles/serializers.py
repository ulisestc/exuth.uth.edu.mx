from rest_framework import serializers
from .models import Egresado, Empresa

class EgresadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Egresado
        fields = ['id', 'user', 'matricula', 'curp', 'cv', 'telefono', 'carrera']
        read_only_fields = ['id', 'user']  # El 'id' es de solo lectura, y 'user' se asignará automáticamente al usuario autenticado.

    def to_representation(self, instance):
        # 1. Obtiene el diccionario original (donde 'carrera' es un número)
        representation = super().to_representation(instance)
        # 2. Sobrescribe ese número con el nombre real de la carrera
        representation['carrera'] = instance.carrera.nombre
        return representation


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            'id', 'user', 'nombre', 'domicilio', 'telefono', 'correo_contacto',
            'actividad_de_la_empresa', 'campo', 'giro', 'sector', 'status'
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