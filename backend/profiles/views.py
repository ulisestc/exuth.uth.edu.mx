from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Egresado, Empresa
from .serializers import EgresadoSerializer, EmpresaSerializer, EmpresaStatusSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django.core.exceptions import PermissionDenied, ValidationError

# Create your views here.

class EgresadoViewSet(viewsets.ModelViewSet):
    serializer_class = EgresadoSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    filterset_fields = ['carrera']
    
    # Podemos buscar por matrícula, curp, o cruzar a la tabla User para buscar por nombre
    search_fields = [
        'matricula', 
        'curp', 
        'user__nombres', 
        'user__apellido_paterno', 
        'user__apellido_materno'
    ]
    
    ordering_fields = ['id']
    ordering = ['-id']

    def perform_create(self, serializer):
        if self.request.user.rol not in ['egresado', 'soporte_ti', 'admin_uth'] and not self.request.user.is_superuser:
            raise PermissionDenied("Tu cuenta no tiene rol de Egresado para crear este perfil.")
        if hasattr(self.request.user, 'egresado'):
            raise ValidationError("Ya tienes un perfil de egresado asociado a tu cuenta.")
        # Asignar el usuario autenticado al crear un egresado
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Egresado.objects.filter(user__deactivated_at__isnull=True)

    def destroy(self, request, *args, **kwargs):
        #SOFT DELETE USANDO DEACTIVATED_AT DE USER
        instance = self.get_object()

        # lógica de borrado suave
        instance.user.deactivated_at = timezone.now()
        instance.user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class EmpresaViewSet(viewsets.ModelViewSet):
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    filterset_fields = ['giro', 'sector', 'status']
    
    search_fields = [
        'nombre', 
        'actividad_de_la_empresa', 
        'correo_contacto'
    ]
    
    # Permitimos ordenar por status para que los admins vean rápido las "pendientes"
    ordering_fields = ['nombre', 'status', 'id']
    ordering = ['-id']

    def perform_create(self, serializer):
        if self.request.user.rol not in ['empresa', 'soporte_ti', 'admin_uth'] and not self.request.user.is_superuser:
            raise PermissionDenied("Tu cuenta no tiene rol de Empresa para crear este perfil.")
        if hasattr(self.request.user, 'empresa'):
            raise ValidationError("Ya tienes un perfil de empresa asociado a tu cuenta.")
        # Asignar el usuario autenticado al crear una empresa
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Empresa.objects.filter(user__deactivated_at__isnull=True)
    
    def destroy(self, request, *args, **kwargs):
        #SOFT DELETE USANDO DEACTIVATED_AT DE USER
        instance = self.get_object()

        # lógica de borrado suave
        instance.user.deactivated_at = timezone.now()
        instance.user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True, 
        methods=['patch'], 
        serializer_class=EmpresaStatusSerializer
    )
    def cambiar_status(self, request, pk=None):
        #RBAC
        if request.user.rol not in ['admin_uth', 'soporte_ti'] and not request.user.is_superuser:
            raise PermissionDenied("No tienes permisos para aprobar o rechazar empresas.")

        # get empresa específica
        empresa = self.get_object()

        # inyectar los datos del request en el serializer
        serializer = self.get_serializer(empresa, data=request.data, partial=True)
        
        # validar y guardar los cambios
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)