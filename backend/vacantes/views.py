from rest_framework import viewsets, permissions
from .models import Vacante
from .serializers import VacanteSerializer
from .permissions import IsEmpresaAuthorOrReadOnly

class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.all()
    serializer_class = VacanteSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmpresaAuthorOrReadOnly]

    #filtros, busquedas y ordenamiento
    filterset_fields = [
        'area_estudio', 
        'nivel_estudios', 
        'transporte'
    ]

    search_fields = [
        'titulo', 
        'funciones_y_actividades', 
        'habilidades_y_competencias', 
        'experiencia'
    ]
    
    ordering_fields = ['sueldo_maximo', 'sueldo_minimo', 'id']
    ordering = ['-id']
    
    def perform_create(self, serializer):
        # Asignar la empresa del usuario autenticado al crear una vacante
        serializer.save(empresa=self.request.user.empresa)