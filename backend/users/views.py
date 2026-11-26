from djoser.views import UserViewSet
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone

#oara viewset de reactivación
from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from drf_spectacular.utils import extend_schema
from .serializers import ReactivateRequestSerializer, ReactivateConfirmSerializer

User = get_user_model()

class CustomUserViewSet(UserViewSet):
    def perform_create(self, serializer, *args, **kwargs):
        super().perform_create(serializer, *args, **kwargs)
        # Si la activación por correo está desactivada, activamos el usuario directamente
        if not settings.DJOSER.get('SEND_ACTIVATION_EMAIL', False):
            user = serializer.instance
            user.is_active = True
            user.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # lógica de borrado suave
        instance.deactivated_at = timezone.now()
        instance.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ReactivateAccountRequestView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ReactivateRequestSerializer)
    def post(self, request):
        return Response(
            {
                'detail': 'La reactivación de cuentas es gestionada exclusivamente por la Dirección de Vinculación y Bolsa de Trabajo UTH. Comunícate a bolsadetrabajo@uth.edu.mx.'
            },
            status=status.HTTP_403_FORBIDDEN,
        )


class ReactivateAccountConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ReactivateConfirmSerializer)
    def post(self, request):
        return Response(
            {
                'detail': 'La reactivación de cuentas es gestionada exclusivamente por la Dirección de Vinculación y Bolsa de Trabajo UTH.'
            },
            status=status.HTTP_403_FORBIDDEN,
        )