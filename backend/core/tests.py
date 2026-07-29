from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import AreaEstudio, Carrera, Giro, Sector, Idioma

User = get_user_model()


class CoreUnitTestSuite(APITestCase):
    """
    Suite de Pruebas Unitarias completas para la App 'core':
    - Consulta pública/autenticada de catálogos institucionales
    - Control de Acceso por Roles (RBAC: Solo Administradores pueden modificar catálogos)
    """

    def setUp(self):
        self.area = AreaEstudio.objects.create(nombre="Tecnologías de la Información")
        self.carrera = Carrera.objects.create(nombre="Tecnologías de la Información", abreviatura="TI", area=self.area)
        self.giro = Giro.objects.create(nombre="Servicios")
        self.sector = Sector.objects.create(nombre="Privado")
        self.idioma = Idioma.objects.create(nombre="Inglés")

        # Usuarios
        self.admin = User.objects.create_user(
            email="admin@test.com", password="Pass123!", nombres="Admin", rol="admin_uth", is_active=True
        )
        self.egresado = User.objects.create_user(
            email="egresado@test.com", password="Pass123!", nombres="Juan", rol="egresado", is_active=True
        )

        # Clientes HTTP
        self.client_admin = APIClient()
        self.client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.admin).access_token}')

        self.client_egresado = APIClient()
        self.client_egresado.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.egresado).access_token}')

    def test_happy_listar_catalogos_por_egresado(self):
        """HAPPY PATH: Egresado puede consultar los catálogos institucionales."""
        res_areas = self.client_egresado.get('/api/v1/core/areas-estudio/')
        self.assertEqual(res_areas.status_code, status.HTTP_200_OK)

        res_carreras = self.client_egresado.get('/api/v1/core/carreras/')
        self.assertEqual(res_carreras.status_code, status.HTTP_200_OK)

        res_giros = self.client_egresado.get('/api/v1/core/giros/')
        self.assertEqual(res_giros.status_code, status.HTTP_200_OK)

        res_idiomas = self.client_egresado.get('/api/v1/core/idiomas/')
        self.assertEqual(res_idiomas.status_code, status.HTTP_200_OK)

    def test_happy_crear_carrera_por_admin(self):
        """HAPPY PATH: Administrador crea una nueva carrera en un área existente."""
        payload = {
            "nombre": "Ingeniería en Ciberseguridad",
            "abreviatura": "ICIB",
            "area": self.area.id
        }
        response = self.client_admin.post('/api/v1/core/carreras/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Carrera.objects.filter(abreviatura="ICIB").count(), 1)

    def test_sad_path_rbac_egresado_no_puede_crear_carrera(self):
        """SAD PATH / RBAC: Egresado intenta crear una carrera -> 403 Forbidden."""
        payload = {
            "nombre": "Carrera No Autorizada",
            "abreviatura": "CNA",
            "area": self.area.id
        }
        response = self.client_egresado.post('/api/v1/core/carreras/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
