from rest_framework import serializers
from django.db import transaction
from .models import Vacante, RequisitoIdioma, Postulacion, Colocacion
from core.models import Idioma

class RequisitoIdiomaSerializer(serializers.ModelSerializer):
    #definir como se recibe el id del idioma
    idioma = serializers.PrimaryKeyRelatedField(queryset=Idioma.objects.all())

    class Meta:
        model = RequisitoIdioma
        fields = ['idioma', 'nivel', 'obligatorio']

class VacanteSerializer(serializers.ModelSerializer):
    #anidar serializer de RequisitoIdioma
    idiomas = RequisitoIdiomaSerializer(many=True, source='requisitos_idioma')

    class Meta:
        model = Vacante
        fields = '__all__'
        read_only_fields = ['empresa', 'clave_vacante', 'status'] # <--- Esto le dice a DRF: "Yo lo lleno en el servidor, ignóralo si viene del frontend"

    def validate(self, attrs):
        sueldo_min = attrs.get('sueldo_minimo')
        sueldo_max = attrs.get('sueldo_maximo')
        if sueldo_min is not None and sueldo_max is not None and sueldo_min > sueldo_max:
            raise serializers.ValidationError("El sueldo mínimo no puede ser mayor que el sueldo máximo.")
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        idiomas_data = validated_data.pop('requisitos_idioma', [])
        vacante = Vacante.objects.create(**validated_data)
        for idioma_data in idiomas_data:
            RequisitoIdioma.objects.create(vacante=vacante, **idioma_data)
        return vacante
    
    @transaction.atomic
    def update(self, instance, validated_data):
        #extraer idiomas
        idiomas_data = validated_data.pop('requisitos_idioma', None)

        # 2. Actualizar los campos propios de la Vacante
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
    
        # 3. Guardar los cambios de la instancia principal en la base de datos
        instance.save()
        
        # 4. Manejar los idiomas (Hard Reset)
        if idiomas_data is not None:
            RequisitoIdioma.objects.filter(vacante=instance).delete()  # Eliminar todos los idiomas existentes
            for idioma_data in idiomas_data:
                RequisitoIdioma.objects.create(vacante=instance, **idioma_data)  # Crear nuevos idiomas
        return instance

class VacanteEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacante
        fields = ['status', 'id']
        read_only_fields = ['id']

class PostulacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['id', 'egresado', 'fecha_postulacion', 'estado'] # campos bliondados (seguridad) 

class PostulacionEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = ['estado', 'id']  # Solo se permite actualizar el estado de la postulación
        read_only_fields = ['id']  # El ID es de solo lectura, no se puede modificar

class ColocacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colocacion
        fields = [
            'id', 'egresado', 'vacante', 'evento', 
            'fecha_colocacion', 'observaciones', 'registrado_por'
        ]
        # Blindaje de auditoría: la fecha es automática y el usuario lo asigna el servidor
        read_only_fields = ['id', 'fecha_colocacion', 'registrado_por']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Traducimos las llaves foráneas para que el GET sea legible en la interfaz
        representation['egresado'] = str(instance.egresado)
        representation['vacante'] = instance.vacante.titulo if instance.vacante else "Colocación Externa"
        if instance.evento:
            representation['evento'] = str(instance.evento)
        if instance.registrado_por:
            representation['registrado_por'] = instance.registrado_por.email
        return representation