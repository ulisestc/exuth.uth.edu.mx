from rest_framework import viewsets
from .models import Evento
from .serializers import EventoSerializer
from.permissions import IsAdminOrReadOnly

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAdminOrReadOnly]

    filterset_fields = ['is_active', 'tipo_evento'] 
    search_fields = ['nombre', 'descripcion', 'lugar'] 
    ordering_fields = ['fecha_inicio', 'id', 'nombre'] 
    ordering = ['-fecha_inicio', '-id']