from rest_framework import serializers
from django.db import transaction
from .models import Vacante, RequisitoIdioma
from core.models import Idioma

class RequisitoIdiomaSerializer(serializers.ModelSerializer):
    #definir como se recibe el id del idioma
    idioma = serializers.PrimaryKeyRelatedField(queryset=Idioma.objects.all())

    class Meta:
        model = RequisitoIdioma
        fields = ['idioma', 'nivel', 'obligatorio']

class VacanteSerializer(serializers.ModelSerializer):
    #anidar serializer de RequisitoIdioma
    idiomas = RequisitoIdiomaSerializer(many=True, source='requisitoidioma_set')

    class Meta:
        model = Vacante
        fields = '__all__'
        read_only_fields = ['empresa'] # <--- Esto le dice a DRF: "Yo lo lleno en el servidor, ignóralo si viene del frontend"

    def validate(self, attrs):
        sueldo_min = attrs.get('sueldo_minimo')
        sueldo_max = attrs.get('sueldo_maximo')
        if sueldo_min is not None and sueldo_max is not None and sueldo_min > sueldo_max:
            raise serializers.ValidationError("El sueldo mínimo no puede ser mayor que el sueldo máximo.")
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        idiomas_data = validated_data.pop('requisitoidioma_set', [])
        vacante = Vacante.objects.create(**validated_data)
        for idioma_data in idiomas_data:
            RequisitoIdioma.objects.create(vacante=vacante, **idioma_data)
        return vacante
    
    @transaction.atomic
    def update(self, instance, validated_data):
        #extraer idiomas
        idiomas_data = validated_data.pop('requisitoidioma_set', None)

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