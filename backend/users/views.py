from djoser.views import UserViewSet
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone

class CustomUserViewSet(UserViewSet):
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # lógica de borrado suave
        instance.deactivated_at = timezone.now()
        instance.save()

        return Response(status=status.HTTP_204_NO_CONTENT)