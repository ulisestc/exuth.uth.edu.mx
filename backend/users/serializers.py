from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active', 'deactivated_at', 'date_joined', 'last_login')
        # Hacemos que deactivated_at sea de solo lectura
        read_only_fields = ('id', 'email', 'rol', 'is_active', 'deactivated_at', 'date_joined', 'last_login')

#serializador custom para evitar que usuario con deactivated_at != None pueda iniciar sesión
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        #1. validación padre -> email y password
        data = super().validate(attrs)

        #2. Si es correcto, self.user contiene el usuario autenticado, verificamos si está desactivado
        if self.user.deactivated_at is not None:
            raise serializers.ValidationError("Este usuario ha sido desactivado y no puede iniciar sesión.")
        return data