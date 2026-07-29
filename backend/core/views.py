from rest_framework import viewsets, permissions
from .models import Giro, Sector, AreaEstudio, Carrera, Idioma
from .serializers import GiroSerializer, IdiomaSerializer, SectorSerializer, AreaEstudioSerializer, CarreraSerializer
from .permissions import IsAdminOrReadOnly

class GiroViewSet(viewsets.ModelViewSet):
    queryset = Giro.objects.all()
    serializer_class = GiroSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    search_fields = ['nombre']
    ordering = ['nombre']

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    search_fields = ['nombre']
    ordering = ['nombre']

class AreaEstudioViewSet(viewsets.ModelViewSet):
    queryset = AreaEstudio.objects.all()
    serializer_class = AreaEstudioSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    search_fields = ['nombre']
    ordering = ['nombre']
class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filterset_fields = ['area']
    search_fields = ['nombre', 'abreviatura']
    ordering = ['nombre']

class IdiomaViewSet(viewsets.ModelViewSet):
    queryset = Idioma.objects.all()
    serializer_class = IdiomaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    search_fields = ['nombre']
    ordering = ['nombre']