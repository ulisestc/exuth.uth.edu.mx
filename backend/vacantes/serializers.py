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
    idiomas = RequisitoIdiomaSerializer(many=True, source='requisitos_idioma', required=False)
    empresa_nombre = serializers.ReadOnlyField(source='empresa.nombre')
    empresa_logo = serializers.ImageField(source='empresa.logo', read_only=True)
    area_estudio_nombre = serializers.ReadOnlyField(source='area_estudio.nombre')
    num_postulaciones = serializers.SerializerMethodField()

    def get_num_postulaciones(self, obj):
        # Lectura directa en O(1) si viene anotado por el queryset
        if hasattr(obj, 'num_postulaciones'):
            return obj.num_postulaciones
        # Fallback de seguridad si es una instancia recién creada en memoria
        return obj.postulaciones.count()

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
    vacante_titulo = serializers.ReadOnlyField(source='vacante.titulo')
    vacante_empresa = serializers.ReadOnlyField(source='vacante.empresa.nombre')
    vacante_modalidad = serializers.ReadOnlyField(source='vacante.modalidad')
    vacante_clave = serializers.ReadOnlyField(source='vacante.clave_vacante')

    # Datos del egresado postulante
    candidato_nombre = serializers.SerializerMethodField()
    candidato_email = serializers.ReadOnlyField(source='egresado.user.email')
    candidato_telefono = serializers.ReadOnlyField(source='egresado.telefono_celular')
    candidato_carrera = serializers.ReadOnlyField(source='egresado.carrera.nombre')
    candidato_nivel_estudios = serializers.ReadOnlyField(source='egresado.nivel_estudios')
    candidato_matricula = serializers.ReadOnlyField(source='egresado.matricula')
    candidato_cv = serializers.SerializerMethodField()
    candidato_habilidades = serializers.ReadOnlyField(source='egresado.habilidades')
    candidato_domicilio = serializers.ReadOnlyField(source='egresado.domicilio')

    def get_candidato_nombre(self, obj):
        if obj.egresado and obj.egresado.user:
            u = obj.egresado.user
            return f"{u.nombres} {u.apellido_paterno} {u.apellido_materno}".strip()
        return "Egresado UTH"

    def get_candidato_cv(self, obj):
        if obj.egresado and obj.egresado.cv:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.egresado.cv.url)
            return obj.egresado.cv.url
        return None

    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['id', 'egresado', 'fecha_postulacion', 'estado'] # campos blindados (seguridad) 

class PostulacionEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = ['estado', 'notas_uth', 'id']  # Se permite actualizar estado y notas de UTH
        read_only_fields = ['id']

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