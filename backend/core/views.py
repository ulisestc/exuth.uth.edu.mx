from rest_framework import viewsets, permissions
from .models import Giro, Sector, AreaEstudio, Carrera, Idioma
from .serializers import GiroSerializer, IdiomaSerializer, SectorSerializer, AreaEstudioSerializer, CarreraSerializer

class GiroViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Giro.objects.all()
    serializer_class = GiroSerializer
    permission_classes = [permissions.IsAuthenticated]

    search_fields = ['nombre']
    ordering = ['nombre']

class SectorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    search_fields = ['nombre']
    ordering = ['nombre']

class AreaEstudioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AreaEstudio.objects.all()
    serializer_class = AreaEstudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    search_fields = ['nombre']
    ordering = ['nombre']
class CarreraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['area']
    search_fields = ['nombre', 'abreviatura']
    ordering = ['nombre']

class IdiomaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Idioma.objects.all()
    serializer_class = IdiomaSerializer
    permission_classes = [permissions.IsAuthenticated]

    search_fields = ['nombre']
    ordering = ['nombre']