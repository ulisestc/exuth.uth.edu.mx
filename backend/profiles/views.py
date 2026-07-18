from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Egresado, Empresa
from .serializers import EgresadoSerializer, EmpresaSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

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

    def get_queryset(self):
        return Empresa.objects.filter(user__deactivated_at__isnull=True)
    
    def destroy(self, request, *args, **kwargs):
        #SOFT DELETE USANDO DEACTIVATED_AT DE USER
        instance = self.get_object()

        # lógica de borrado suave
        instance.user.deactivated_at = timezone.now()
        instance.user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)