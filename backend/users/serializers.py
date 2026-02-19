from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'password', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol')


class CurrentUserSerializer(BaseUserSerializer):
    """Serializer para editar el propio usuario /users/me/"""
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active', 'is_staff', 'date_joined')
        read_only_fields = ('id', 'is_staff', 'date_joined', 'rol')


class UserRoleSerializer(BaseUserSerializer):
    """Serializer para asignar rol de administrador /users/{id}/"""
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active', 'is_staff')
        read_only_fields = ('id', 'email', 'nombres', 'apellido_paterno', 'apellido_materno')