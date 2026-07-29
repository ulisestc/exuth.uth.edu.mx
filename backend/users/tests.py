from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

User = get_user_model()


class UsersUnitTestSuite(APITestCase):
    """
    Suite de Pruebas Unitarias completas para la App 'users':
    - Registro Djoser y Generación de Tokens JWT
    - Validación Legal Obligatoria del Aviso de Privacidad (acepta_aviso_privacidad)
    - Desactivación de Cuenta / Soft Delete (deactivated_at)
    - Control de Acceso por Roles (RBAC)
    """

    def setUp(self):
        self.client = APIClient()

        # 1. Crear Administrador
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="StrongPassword123!",
            nombres="Admin",
            apellido_paterno="UTH",
            apellido_materno="System",
            rol="admin_uth",
            is_active=True
        )

        # 2. Crear Egresado
        self.egresado = User.objects.create_user(
            email="egresado@test.com",
            password="StrongPassword123!",
            nombres="Juan",
            apellido_paterno="García",
            apellido_materno="López",
            rol="egresado",
            is_active=True
        )

        # 3. Configurar Clientes Autenticados
        self.client_admin = APIClient()
        token_admin = RefreshToken.for_user(self.admin).access_token
        self.client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {token_admin}')

        self.client_egresado = APIClient()
        token_egresado = RefreshToken.for_user(self.egresado).access_token
        self.client_egresado.credentials(HTTP_AUTHORIZATION=f'JWT {token_egresado}')

    # -------------------------------------------------------------------------
    # 1. AUTENTICACIÓN Y REGISTRO
    # -------------------------------------------------------------------------

    def test_registro_usuario_djoser(self):
        """HAPPY PATH: Registro de usuario a través de los endpoints de Djoser."""
        payload = {
            "email": "nuevo_usuario@test.com",
            "password": "StrongPassword123!",
            "re_password": "StrongPassword123!",
            "nombres": "Carlos",
            "apellido_paterno": "Martínez",
            "apellido_materno": "Sánchez",
            "rol": "egresado"
        }
        response = self.client.post('/api/v1/auth/users/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email="nuevo_usuario@test.com").count(), 1)

    def test_generacion_token_jwt(self):
        """HAPPY PATH: Obtener par de tokens JWT (access/refresh) con credenciales válidas."""
        response = self.client.post('/api/v1/auth/jwt/create/', {
            "email": "egresado@test.com",
            "password": "StrongPassword123!"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    # -------------------------------------------------------------------------
    # 2. AVISO DE PRIVACIDAD (VALIDACIÓN LEGAL)
    # -------------------------------------------------------------------------

    def test_happy_path_aceptacion_aviso_privacidad(self):
        """HAPPY PATH: Aceptar el aviso de privacidad registra la marca de tiempo."""
        self.egresado.acepta_aviso_privacidad = True
        self.egresado.fecha_aviso_privacidad = timezone.now()
        self.egresado.save()

        self.egresado.refresh_from_db()
        self.assertTrue(self.egresado.acepta_aviso_privacidad)
        self.assertIsNotNone(self.egresado.fecha_aviso_privacidad)

    def test_sad_path_desactivacion_si_no_acepta_aviso(self):
        """SAD PATH: Intentar activar cuenta inactiva con acepta_aviso_privacidad=False falla con 400 Bad Request."""
        u_inactivo = User.objects.create_user(
            email="inactivo@test.com",
            password="StrongPassword123!",
            nombres="Inactivo",
            apellido_paterno="Test",
            apellido_materno="Test",
            rol="egresado",
            is_active=False
        )
        uid = urlsafe_base64_encode(force_bytes(u_inactivo.pk))
        token = default_token_generator.make_token(u_inactivo)

        payload = {
            "uid": uid,
            "token": token,
            "acepta_aviso_privacidad": False
        }
        response = self.client.post('/api/v1/auth/users/activation/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("acepta_aviso_privacidad", response.data)

    # -------------------------------------------------------------------------
    # 3. SOFT DELETE Y CONTROL DE ACCESO (RBAC)
    # -------------------------------------------------------------------------

    def test_happy_path_soft_delete_propio_usuario(self):
        """HAPPY PATH: Usuario ejecuta borrado lógico (soft delete) de su propia cuenta."""
        response = self.client_egresado.delete(f'/api/v1/auth/users/{self.egresado.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.egresado.refresh_from_db()
        self.assertIsNotNone(self.egresado.deactivated_at)

    def test_sad_path_egresado_no_puede_eliminar_otro_usuario(self):
        """SAD PATH / RBAC: Un egresado no puede eliminar la cuenta de otro usuario."""
        response = self.client_egresado.delete(f'/api/v1/auth/users/{self.admin.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)