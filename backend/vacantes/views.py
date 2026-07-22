from rest_framework import viewsets, permissions, exceptions
from .models import Vacante, Postulacion
from .serializers import VacanteSerializer, PostulacionSerializer, PostulacionEstadoSerializer
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

class PostulacionViewSet(viewsets.ModelViewSet):
    queryset = Postulacion.objects.all()
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Si es empresa. .. mostrar todas las postulaciones de sus vacantes. si es egresado, mostrar solo sus postulaciones
        if hasattr(self.request.user, 'empresa'):
            return self.queryset.filter(vacante__empresa=self.request.user.empresa)
        elif hasattr(self.request.user, 'egresado'):
            return self.queryset.filter(egresado=self.request.user.egresado)
        return self.queryset if (self.request.user.rol in ['soporte_ti', 'admin_uth'] or self.request.user.is_superuser) else self.queryset.none()

    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update':
            return PostulacionEstadoSerializer  # Usar el serializer de estado para actualizaciones
        return PostulacionSerializer  # Usar el serializer completo para otras acciones

    def perform_create(self, serializer):
        # si es empresa, no puede crear postulaciones. si es egresado, asignar el egresado del usuario autenticado al crear una postulacion
        if hasattr(self.request.user, 'egresado'):
            serializer.save(egresado=self.request.user.egresado)
        else:
            raise exceptions.PermissionDenied("Solo los egresados pueden crear postulaciones.") #403
    
    def perform_update(self, serializer):
        # Solo permitir que las empresas, soporte_ti y admin_uth actualicen el estado de la postulación
        if hasattr(self.request.user, 'empresa') or self.request.user.rol in ['soporte_ti', 'admin_uth'] or self.request.user.is_superuser:
            serializer.save()
        else:
            raise exceptions.PermissionDenied("No tienes permiso para actualizar el estado de esta postulación.") #403 