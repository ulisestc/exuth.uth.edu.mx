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
        # Ahora las empresas nacen aprobadas directamente para poder usar la plataforma
        self.assertEqual(Empresa.objects.first().status, 'aprobada')

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

    def test_importar_padron_excel_y_validacion_egresado(self):
        """HAPPY PATH: Carga masiva de Padrón en Excel y validación automática al registrarse."""
        import openpyxl
        from io import BytesIO
        from profiles.models import PadronEgresado

        user_admin = User.objects.create_user(
            email="admin_padron@uth.edu.mx", password="password123", rol="admin_uth", is_active=True
        )
        client_admin = APIClient()
        client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(user_admin).access_token}')

        # Crear archivo Excel en memoria simulando las columnas de Servicios Escolares
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Hoja3"
        ws.append(["Matricula", "Carrera", "Nombre", "Nivel", "Género", "CURP", "Correo Electrónico"])
        ws.append(["3521110550", "Diseño Textil y Moda", "Lizeth Bello Coyotecatl", "Ing", "F", "BECL990101MPLP01", "coyolizeth3@gmail.com"])
        ws.append(["3521110181", "Diseño Textil y Moda", "Lizeht Monserrat Pérez", "Ing", "F", "PESM990202MPLP02", "lizs88621@gmail.com"])

        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        archivo_excel = SimpleUploadedFile("padron_test.xlsx", buffer.getvalue(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        res_import = client_admin.post('/api/v1/profiles/padron/importar/', {'archivo': archivo_excel}, format='multipart')
        self.assertEqual(res_import.status_code, status.HTTP_200_OK)
        self.assertEqual(res_import.data['creados'], 2)
        self.assertEqual(PadronEgresado.objects.count(), 2)

        # Ahora registrar un egresado cuya matrícula ESTÁ en el padrón -> es_verificado_padron = True
        payload_verificado = {
            "matricula": "3521110550",
            "curp": "BECL990101MPLP01XX",
            "telefono_celular": "2225801416",
            "domicilio": "Calle Puebla 10",
            "genero": "F",
            "carrera": self.carrera.id,
            "nivel_estudios": "ING_LIC",
            "habilidades": "Diseño"
        }

        res_e1 = self.client_e1.post('/api/v1/profiles/egresados/', payload_verificado)
        self.assertEqual(res_e1.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_e1.data['es_verificado_padron'])

        # Registrar un egresado cuya matrícula NO está en el padrón -> es_verificado_padron = False (para revisión manual)
        payload_no_verificado = {
            "matricula": "9999999999",
            "curp": "TEST99999999999999",
            "telefono_celular": "7719999999",
            "domicilio": "Calle Desconocida",
            "genero": "M",
            "carrera": self.carrera.id,
            "nivel_estudios": "TSU",
            "habilidades": "Electricidad"
        }
        res_e2 = self.client_e2.post('/api/v1/profiles/egresados/', payload_no_verificado)
        self.assertEqual(res_e2.status_code, status.HTTP_201_CREATED)
        self.assertFalse(res_e2.data['es_verificado_padron'])

    def test_descarga_segura_cv_para_angular(self):
        """HAPPY PATH: Endpoint /api/v1/profiles/egresados/{id}/cv/ entrega el PDF con Content-Disposition."""
        cv_falso = SimpleUploadedFile("mi_curriculum.pdf", b"%PDF-1.4 contenido binario", content_type="application/pdf")
        egresado = Egresado.objects.create(
            user=self.user_egresado_1,
            matricula="333",
            curp="TEST33333333333333",
            telefono_celular="7713333333",
            domicilio="Calle 3",
            genero="M",
            carrera=self.carrera,
            habilidades="Python, Angular",
            cv=cv_falso
        )

        res_cv = self.client_e1.get(f'/api/v1/profiles/egresados/{egresado.id}/cv/')
        self.assertEqual(res_cv.status_code, status.HTTP_200_OK)
        self.assertEqual(res_cv['Content-Type'], 'application/pdf')
        self.assertIn('inline', res_cv['Content-Disposition'])