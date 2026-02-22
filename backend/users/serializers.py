from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    def validate_rol(self,value):
        """
            Validamos que solo se pueda crear un usuario 'egresado' o 'empresa'
            'admin_uth' solo lo puede crear alguien de SISTEMAS y 'soporte_ti' solo se puede crear
            con superusuario desde consola.
        """
        if value not in ['egresado', 'empresa']:
            raise serializers.ValidationError("Solo se permite crear usuarios con rol 'egresado' o 'empresa'.")
        return value
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'password', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol')

class CustomUserSerializer(BaseUserSerializer):
    """Serializer para editar el propio usuario /users/me/"""
    def validate_is_deactivated(self,value):
        #definimos que un usuario se pueda desactivar, pero no activar manualmente
        if self.instance.is_deactivated == True and value == False:
            raise serializers.ValidationError("No se puede activar manualmente un usuario desactivado.")
        return value
    
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active','is_deactivated', 'date_joined', 'last_login')
        read_only_fields = ('id', 'email', 'rol', 'is_active', 'date_joined', 'last_login')