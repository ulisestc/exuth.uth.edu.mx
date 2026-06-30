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
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            #solo si usuario es desactivado sigue
            if user.deactivated_at is not None:
                # 1 encriptar id para url
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                # 2 generar token
                token = default_token_generator.make_token(user)

                #3 construir enlace
                reactivation_link = f"{settings.FRONTEND_URL}/reactivate-account/{uid}/{token}/"

                #4. enviar correo
                send_mail(
                    subject="Reactivación de Cuenta - EXUTH",
                    message=f"Hola {user.nombres}, haz clic en el siguiente enlace para reactivar tu cuenta: {reactivation_link}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
        except User.DoesNotExist:
            # No revelar si el usuario existe o no
            pass
        
        return Response({'message': 'Si el correo electrónico existe y la cuenta está desactivada, se ha enviado un enlace de reactivación.'}, status=status.HTTP_200_OK)
    
class ReactivateAccountConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ReactivateConfirmSerializer)
    def post(self,request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')

        if not uidb64 or not token:
            return Response({'error': 'Faltan credenciales de reactivación'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            #1. decodificar uid
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        #validar usuario existente y que token sea correcto / no expirado
        if user is not None and default_token_generator.check_token(user, token):
            # Reactivar la cuenta
            user.deactivated_at = None
            user.save()
            return Response({'message': 'Cuenta reactivada exitosamente.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Enlace de reactivación inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)