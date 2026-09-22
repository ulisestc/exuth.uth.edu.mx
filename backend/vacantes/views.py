from rest_framework import viewsets, permissions, exceptions, status
from rest_framework.response import Response
from .models import Vacante, Postulacion, Colocacion
from .serializers import VacanteSerializer, PostulacionSerializer, PostulacionEstadoSerializer, VacanteEstadoSerializer, ColocacionSerializer
from .permissions import IsEmpresaAuthorOrReadOnly
from profiles.permissions import IsEmpresaAprobadaOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django.db import transaction

class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.all()
    serializer_class = VacanteSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmpresaAuthorOrReadOnly]

    #filtros, busquedas y ordenamiento
    filterset_fields = [
        'area_estudio', 
        'nivel_estudios', 
        'incluye_transporte'
    ]

    search_fields = [
        'titulo', 
        'responsabilidades', 
        'habilidades', 
        'experiencia'
    ]
    
    ordering_fields = ['sueldo_maximo', 'sueldo_minimo', 'id']
    ordering = ['-id']
    
    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'empresa'):
            raise PermissionDenied("Solo las empresas registradas pueden crear vacantes desde la API. Los administradores deben usar el panel interno de Django.")       
        # Asignar la empresa del usuario autenticado al crear una vacante
        serializer.save(empresa=self.request.user.empresa)

    @action(
        detail=True, 
        methods=['patch'], 
        serializer_class=VacanteEstadoSerializer
    )
    def cambiar_status(self, request, pk=None):
        #RBAC
        if request.user.rol not in ['admin_uth', 'soporte_ti'] and not request.user.is_superuser:
            raise PermissionDenied("No tienes permisos para aprobar o rechazar vacantes.")

        # get Vacante específica
        vacante = self.get_object()

        # inyectar los datos del request en el serializer
        serializer = self.get_serializer(vacante, data=request.data, partial=True)
        
        # validar y guardar los cambios
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

class PostulacionViewSet(viewsets.ModelViewSet):
    queryset = Postulacion.objects.all()
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si es empresa, SOLO puede ver las postulaciones aprobadas por la UTH (enviada_empresa, Aceptada, Rechazada)
        if hasattr(user, 'empresa'):
            return self.queryset.filter(
                vacante__empresa=user.empresa,
                estado__in=['enviada_empresa', 'Aceptada', 'Rechazada']
            )
        # Si es egresado, ve todas sus postulaciones
        elif hasattr(user, 'egresado'):
            return self.queryset.filter(egresado=user.egresado)
        # Admin UTH y Soporte TI ven todas (incluidas las pendientes en revision_uth)
        return self.queryset if (user.rol in ['soporte_ti', 'admin_uth'] or user.is_superuser) else self.queryset.none()

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'cambiar_estado']:
            return PostulacionEstadoSerializer
        return PostulacionSerializer

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'egresado'):
            egresado = self.request.user.egresado
            vacante = serializer.validated_data.get('vacante')
            if Postulacion.objects.filter(vacante=vacante, egresado=egresado).exists():
                raise exceptions.ValidationError("Ya te has postulado a esta vacante.") #400
            # Nace automáticamente con estado 'revision_uth'
            serializer.save(egresado=egresado, estado='revision_uth')
        else:
            raise exceptions.PermissionDenied("Solo los egresados pueden crear postulaciones.") #403
    
    @action(detail=True, methods=['patch', 'post'], url_path='aprobar-uth')
    def aprobar_uth(self, request, pk=None):
        """Filtro UTH: El Administrador aprueba el CV y lo envía a la Empresa."""
        if request.user.rol not in ['admin_uth', 'soporte_ti'] and not request.user.is_superuser:
            raise exceptions.PermissionDenied("Solo el personal de la UTH puede validar y aprobar postulaciones.")
        
        postulacion = self.get_object()
        postulacion.estado = 'enviada_empresa'
        if 'notas_uth' in request.data:
            postulacion.notas_uth = request.data['notas_uth']
        postulacion.save()
        return Response(PostulacionSerializer(postulacion).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch', 'post'], url_path='rechazar-uth')
    def rechazar_uth(self, request, pk=None):
        """Filtro UTH: El Administrador detiene la postulación por no cubrir el perfil."""
        if request.user.rol not in ['admin_uth', 'soporte_ti'] and not request.user.is_superuser:
            raise exceptions.PermissionDenied("Solo el personal de la UTH puede rechazar postulaciones en filtro.")
        
        postulacion = self.get_object()
        postulacion.estado = 'rechazada_uth'
        if 'notas_uth' in request.data:
            postulacion.notas_uth = request.data['notas_uth']
        postulacion.save()
        return Response(PostulacionSerializer(postulacion).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        # Validación estricta por rol
        if hasattr(user, 'empresa'):
            # La empresa solo puede evaluar candidatos que ya hayan pasado el filtro UTH
            if instance.estado not in ['enviada_empresa', 'Aceptada', 'Rechazada']:
                raise exceptions.PermissionDenied("Esta postulación aún no ha sido aprobada por la UTH.")
            nuevo_estado = serializer.validated_data.get('estado')
            if nuevo_estado not in ['Aceptada', 'Rechazada']:
                raise exceptions.ValidationError({"estado": "La empresa solo puede establecer el estado en 'Aceptada' o 'Rechazada'."})
        elif user.rol not in ['soporte_ti', 'admin_uth'] and not user.is_superuser:
            raise exceptions.PermissionDenied("No tienes permiso para actualizar el estado de esta postulación.")

        updated_instance = serializer.save()
        
        # Si el nuevo estado es 'Aceptada', creamos o verificamos la Colocación
        if updated_instance.estado == 'Aceptada':
            Colocacion.objects.get_or_create(
                egresado=updated_instance.egresado,
                vacante=updated_instance.vacante,
                defaults={
                    'registrado_por': user,
                    'observaciones': f'Colocación generada automáticamente al aceptar la postulación #{updated_instance.id}.'
                }
            )
class ColocacionViewSet(viewsets.ModelViewSet):
    serializer_class = ColocacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    filterset_fields = ['egresado', 'vacante', 'evento', 'registrado_por']
    ordering_fields = ['fecha_colocacion', 'id']
    ordering = ['-fecha_colocacion', '-id']
    
    # 2. Búsqueda relacional profunda
    search_fields = [
        'egresado__matricula',
        'egresado__curp',
        'egresado__user__nombres',
        'vacante__titulo',
        'vacante__empresa__nombre'
    ]

    def get_queryset(self):
        # Segmentación estricta de visibilidad según el rol del usuario
        user = self.request.user
        
        # Admin y Soporte TI ven todo el historial de la universidad
        if user.rol in ['admin_uth', 'soporte_ti'] or user.is_superuser:
            return Colocacion.objects.all()
            
        # Las empresas solo ven las colocaciones vinculadas a sus propias vacantes
        elif user.rol == 'empresa' and hasattr(user, 'empresa'):
            return Colocacion.objects.filter(vacante__empresa=user.empresa)
            
        # Los egresados únicamente ven sus propios éxitos laborales
        elif user.rol == 'egresado' and hasattr(user, 'egresado'):
            return Colocacion.objects.filter(egresado=user.egresado)
            
        return Colocacion.objects.none()

    def perform_create(self, serializer):
        """
        Solo Admins, Soporte TI y Empresas pueden registrar colocaciones manuales.
        Los egresados tienen bloqueada la creación.
        """
        user = self.request.user
        if user.rol not in ['admin_uth', 'soporte_ti', 'empresa'] and not user.is_superuser:
            raise PermissionDenied("Tu rol no tiene permisos para registrar colocaciones laborales.")
            
        # Inyección automática de la autoría desde el token de sesión
        serializer.save(registrado_por=user)

    def perform_update(self, serializer):
        """
        Admins pueden editar todo; la Empresa solo puede editar 
        las colocaciones de sus propias vacantes; Egresados bloqueados.
        """
        user = self.request.user
        if user.rol in ['admin_uth', 'soporte_ti'] or user.is_superuser:
            serializer.save()
            return

        colocacion = self.get_object()
        if user.rol == 'empresa' and hasattr(user, 'empresa') and colocacion.vacante.empresa == user.empresa:
            serializer.save()
            return
            
        raise PermissionDenied("No tienes permisos para modificar este registro de colocación.")

    def perform_destroy(self, instance):
        """
        El borrado de un éxito laboral es una operación crítica. 
        Exclusiva para personal administrativo.
        """
        user = self.request.user
        if user.rol not in ['admin_uth', 'soporte_ti'] and not user.is_superuser:
            raise PermissionDenied("Solo el personal administrativo de la UTH puede eliminar registros de colocación.")
            
        instance.delete()