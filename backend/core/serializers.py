from rest_framework import serializers
from .models import Giro, Sector, AreaEstudio, Carrera, Idioma

class GiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Giro
        fields = '__all__'

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'

class AreaEstudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaEstudio
        fields = '__all__'

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = '__all__'

class IdiomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idioma
        fields = '__all__'