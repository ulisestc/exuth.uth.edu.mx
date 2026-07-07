from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from profiles.models import Egresado, Empresa
from core.models import AreaEstudio, Carrera, Giro, Sector

User = get_user_model()

class ProfilesE2ETests(APITestCase):
    def setUp(self):
        self.area = AreaEstudio.objects.create(nombre="Ingeniería y Ciencias Exactas")
        self.carrera = Carrera.objects.create(nombre="Ingeniería de Software", area=self.area)
        
        # 2. Crear usuarios y FUERZA la activación (incluyendo campos requeridos)
        for email, rol, nombres in [
            ("egresado1@test.com", "egresado", "Egresado Uno"),
            ("egresado2@test.com", "egresado", "Egresado Dos"),
            ("empresa@test.com", "empresa", "Empresa Uno"),
        ]:
            u = User.objects.create_user(
                email=email,
                password="password123",
                rol=rol,
                nombres=nombres,
                apellido_paterno='Prueba',
                apellido_materno='Test'
            )
            u.is_active = True
            u.save() # Guardado explícito para persistir

            if email == "egresado1@test.com": self.user_egresado_1 = u
            if email == "egresado2@test.com": self.user_egresado_2 = u
            if email == "empresa@test.com": self.user_empresa = u

        # 3. Crear catálogos necesarios para Empresa
        self.giro = Giro.objects.create(nombre="Tecnología")
        self.sector = Sector.objects.create(nombre="TI")

        # 3. Preparar Clientes HTTP
        self.client_e1 = APIClient()
        self.client_e2 = APIClient()
        self.client_emp = APIClient()
        self.client_anon = APIClient() # Sin token

        # 4. Inyectar Tokens JWT con el prefijo correcto: 'JWT'
        token_e1 = RefreshToken.for_user(self.user_egresado_1).access_token
        self.client_e1.credentials(HTTP_AUTHORIZATION=f'JWT {token_e1}')
        
        token_e2 = RefreshToken.for_user(self.user_egresado_2).access_token
        self.client_e2.credentials(HTTP_AUTHORIZATION=f'JWT {token_e2}')
        
        token_emp = RefreshToken.for_user(self.user_empresa).access_token
        self.client_emp.credentials(HTTP_AUTHORIZATION=f'JWT {token_emp}')

    def test_crear_perfil_egresado_con_cv_multipart(self):
        """Prueba de subida binaria (Multipart) que fallaba en Swagger."""
        cv_falso = SimpleUploadedFile("curriculum.pdf", b"archivo_binario", content_type="application/pdf")
        
        payload = {
            "user": self.user_egresado_1.id,
            "matricula": "202012345",
            "curp": "TEST12345678901234",
            "telefono": "2221234567",
            "carrera": self.carrera.id,
            "cv": cv_falso
        }
        
        # Usamos format='multipart' para simular Postman/Formulario web
        response = self.client_e1.post('/api/v1/profiles/egresados/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Egresado.objects.count(), 1)

    def test_crear_perfil_empresa(self):
        """Valida que una empresa pueda crearse con estado por defecto."""
        payload = {
            "user": self.user_empresa.id,
            "nombre": "Tech Corp",
            "domicilio": "Calle Falsa 123",
            "telefono": "2229876543",
            "correo_contacto": "contacto@techcorp.com",
            "actividad_de_la_empresa": "Desarrollo de software",
            "campo": "Servicios",
            "giro": self.giro.id,
            "sector": self.sector.id,
        }

        response = self.client_emp.post('/api/v1/profiles/empresas/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Empresa.objects.count(), 1)

    def test_seguridad_is_authenticated(self):
        """Garantiza que nadie sin token pueda ver los datos."""
        response = self.client_anon.get('/api/v1/profiles/egresados/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_seguridad_is_owner_or_read_only(self):
        """Valida la autorización horizontal: Leer sí, Editar no."""
        # Egresado 1 tiene un perfil
        perfil_e1 = Egresado.objects.create(
            user=self.user_egresado_1, matricula="111", curp="111", telefono="111", carrera=self.carrera
        )
        
        # Egresado 2 intenta leer el perfil de 1 -> OK
        res_get = self.client_e2.get(f'/api/v1/profiles/egresados/{perfil_e1.id}/')
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)

        # Egresado 2 intenta editar el teléfono de 1 -> FORBIDDEN
        res_patch = self.client_e2.patch(f'/api/v1/profiles/egresados/{perfil_e1.id}/', {"telefono": "999"})
        self.assertEqual(res_patch.status_code, status.HTTP_403_FORBIDDEN)

    def test_soft_delete_y_filtro_antifantasmas(self):
        """Comprueba la lógica de desactivación y ocultamiento."""
        perfil_e1 = Egresado.objects.create(
            user=self.user_egresado_1, matricula="111", curp="111", telefono="111", carrera=self.carrera
        )

        # 1. Egresado 1 borra su cuenta
        res_delete = self.client_e1.delete(f'/api/v1/profiles/egresados/{perfil_e1.id}/')
        self.assertEqual(res_delete.status_code, status.HTTP_204_NO_CONTENT)

        # 2. Integridad de BD: El registro físico de Egresado sigue vivo (Soft Delete)
        self.assertEqual(Egresado.objects.count(), 1)

        # 3. Cascada inversa: El usuario base recibió la marca de tiempo de desactivación
        self.user_egresado_1.refresh_from_db()
        self.assertIsNotNone(self.user_egresado_1.deactivated_at)

        # 4. ViewSet get_queryset: El Egresado ya no aparece en el listado general
        res_get_all = self.client_emp.get('/api/v1/profiles/egresados/')
        self.assertEqual(len(res_get_all.data['results']), 0)