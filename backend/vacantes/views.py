from rest_framework import viewsets, permissions
from .models import Vacante
from .serializers import VacanteSerializer
from .permissions import IsEmpresaAuthorOrReadOnly

class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.all()
    serializer_class = VacanteSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmpresaAuthorOrReadOnly]

    def perform_create(self, serializer):
        # Asignar la empresa del usuario autenticado al crear una vacante
        serializer.save(empresa=self.request.user.empresa)