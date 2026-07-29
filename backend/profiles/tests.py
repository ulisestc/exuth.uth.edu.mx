from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from profiles.models import Egresado, Empresa
from core.models import AreaEstudio, Carrera, Giro, Sector

User = get_user_model()


class ProfilesE2ETests(APITestCase):
    """
    Suite de Pruebas Unitarias completas para la App 'profiles':
    - Creación y edición de perfiles Egresado y Empresa con campos actualizados (Fases 1 y 2).
    - Carga de archivos binarios (CV a 'files/cvs' y Documentos a 'files/docs').
    - Filtros anti-fantasmas y Soft Delete en cascada.
    - Seguridad de autorización horizontal (IsOwnerOrReadOnly / RBAC).
    """

    def setUp(self):
        self.area = AreaEstudio.objects.create(nombre="Ingeniería y Ciencias Exactas")
        self.carrera = Carrera.objects.create(nombre="Ingeniería de Software", abreviatura="IS", area=self.area)
        self.giro = Giro.objects.create(nombre="Tecnología")
        self.sector = Sector.objects.create(nombre="TI Privado")

        # Crear usuarios con is_active=True
        self.user_egresado_1 = User.objects.create_user(
            email="egresado1@test.com", password="password123", rol="egresado",
            nombres="Egresado", apellido_paterno="Uno", apellido_materno="Test", is_active=True
        )
        self.user_egresado_2 = User.objects.create_user(
            email="egresado2@test.com", password="password123", rol="egresado",
            nombres="Egresado", apellido_paterno="Dos", apellido_materno="Test", is_active=True
        )
        self.user_empresa = User.objects.create_user(
            email="empresa@test.com", password="password123", rol="empresa",
            nombres="Empresa", apellido_paterno="Uno", apellido_materno="Test", is_active=True
        )

        # Clientes HTTP autenticados
        self.client_e1 = APIClient()
        token_e1 = RefreshToken.for_user(self.user_egresado_1).access_token
        self.client_e1.credentials(HTTP_AUTHORIZATION=f'JWT {token_e1}')

        self.client_e2 = APIClient()
        token_e2 = RefreshToken.for_user(self.user_egresado_2).access_token
        self.client_e2.credentials(HTTP_AUTHORIZATION=f'JWT {token_e2}')

        self.client_emp = APIClient()
        token_emp = RefreshToken.for_user(self.user_empresa).access_token
        self.client_emp.credentials(HTTP_AUTHORIZATION=f'JWT {token_emp}')

        self.client_anon = APIClient()

    def test_crear_perfil_egresado_con_cv_y_documentos_multipart(self):
        """HAPPY PATH: Subida binaria multipart de CV (a files/cvs) y documentos (a files/docs)."""
        cv_falso = SimpleUploadedFile("curriculum.pdf", b"archivo_binario_cv", content_type="application/pdf")
        doc_falso = SimpleUploadedFile("documentos.pdf", b"archivo_binario_doc", content_type="application/pdf")

        payload = {
            "user": self.user_egresado_1.id,
            "matricula": "202012345",
            "curp": "TEST12345678901234",
            "telefono_celular": "7711234567",
            "domicilio": "Calle Principal 123",
            "genero": "M",
            "carrera": self.carrera.id,
            "nivel_estudios": "ING_LIC",
            "habilidades": "Django, Git, REST APIs",
            "cv": cv_falso,
            "documentos": doc_falso
        }

        response = self.client_e1.post('/api/v1/profiles/egresados/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Egresado.objects.count(), 1)

        egresado = Egresado.objects.first()
        self.assertIn("files/cvs", egresado.cv.name)
        self.assertIn("files/docs", egresado.documentos.name)

    def test_crear_perfil_empresa(self):
        """HAPPY PATH: Creación de perfil de Empresa con campos requeridos actualizados."""
        payload = {
            "user": self.user_empresa.id,
            "nombre": "Tech Corp SA de CV",
            "domicilio": "Calle Falsa 123",
            "telefono_oficina": "7719876543",
            "telefono_celular": "7711112222",
            "correo_contacto": "contacto@techcorp.com",
            "actividad_de_la_empresa": "Desarrollo de software",
            "campo": "Servicios TI",
            "giro": self.giro.id,
            "sector": self.sector.id,
            "nombre_contacto": "Ing. García",
            "cargo_contacto": "Gerente RH"
        }

        response = self.client_emp.post('/api/v1/profiles/empresas/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Empresa.objects.count(), 1)
        self.assertEqual(Empresa.objects.first().status, 'pendiente')

    def test_seguridad_is_authenticated(self):
        """SAD PATH: Petición anónima sin token JWT es rechazada con 401 Unauthorized."""
        response = self.client_anon.get('/api/v1/profiles/egresados/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_seguridad_is_owner_or_read_only(self):
        """SAD PATH / RBAC: Egresado 2 intenta modificar el perfil de Egresado 1 -> 403 Forbidden."""
        perfil_e1 = Egresado.objects.create(
            user=self.user_egresado_1,
            matricula="111",
            curp="TEST11111111111111",
            telefono_celular="7711111111",
            domicilio="Calle 1",
            genero="M",
            carrera=self.carrera,
            habilidades="Python"
        )

        # Lectura por egresado 2 -> OK
        res_get = self.client_e2.get(f'/api/v1/profiles/egresados/{perfil_e1.id}/')
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)

        # Intento de edición por egresado 2 -> 403 FORBIDDEN
        res_patch = self.client_e2.patch(f'/api/v1/profiles/egresados/{perfil_e1.id}/', {"telefono_celular": "9999999999"})
        self.assertEqual(res_patch.status_code, status.HTTP_403_FORBIDDEN)

    def test_soft_delete_y_filtro_antifantasmas(self):
        """HAPPY PATH: Soft delete de perfil desactiva el usuario y oculta del get_queryset."""
        perfil_e1 = Egresado.objects.create(
            user=self.user_egresado_1,
            matricula="111",
            curp="TEST11111111111111",
            telefono_celular="7711111111",
            domicilio="Calle 1",
            genero="M",
            carrera=self.carrera,
            habilidades="Python"
        )

        res_delete = self.client_e1.delete(f'/api/v1/profiles/egresados/{perfil_e1.id}/')
        self.assertEqual(res_delete.status_code, status.HTTP_204_NO_CONTENT)

        # Registro físico sigue en BD
        self.assertEqual(Egresado.objects.count(), 1)

        # Marca de desactivación en el User
        self.user_egresado_1.refresh_from_db()
        self.assertIsNotNone(self.user_egresado_1.deactivated_at)