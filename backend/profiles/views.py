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
    
    def get_queryset(self):
        return Empresa.objects.filter(user__deactivated_at__isnull=True)
    
    def destroy(self, request, *args, **kwargs):
        #SOFT DELETE USANDO DEACTIVATED_AT DE USER
        instance = self.get_object()

        # lógica de borrado suave
        instance.user.deactivated_at = timezone.now()
        instance.user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)