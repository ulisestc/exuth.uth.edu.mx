from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Giro, Sector, AreaEstudio, Carrera, Idioma
from profiles.models import Egresado, Empresa
from vacantes.models import Vacante, Postulacion, Colocacion, RequisitoIdioma

User = get_user_model()


class VacantesUnitTestSuite(APITestCase):
    """
    Suite de Pruebas Unitarias completas para la App 'vacantes':
    - CRUD de Vacantes e idiomas requeridos
    - Validaciones personalizadas de sueldo (sueldo_minimo <= sueldo_maximo)
    - Postulaciones y prevención de candidaturas duplicadas (UniqueConstraint)
    - Registro de Colocaciones y sincronización automática egresado.colocado = True
    - Control de Acceso por Roles (RBAC)
    """

    def setUp(self):
        self.area = AreaEstudio.objects.create(nombre="Tecnologías de la Información y Comunicación")
        self.carrera = Carrera.objects.create(nombre="Tecnologías de la Información", abreviatura="TI", area=self.area)
        self.giro = Giro.objects.create(nombre="Servicios")
        self.sector = Sector.objects.create(nombre="Privado")
        self.idioma = Idioma.objects.create(nombre="Inglés")

        # Usuarios
        self.admin = User.objects.create_user(
            email="admin@test.com", password="Pass123!", nombres="Admin", rol="admin_uth", is_active=True
        )
        self.u_empresa = User.objects.create_user(
            email="empresa@test.com", password="Pass123!", nombres="Tech Solutions", rol="empresa", is_active=True
        )
        self.u_egresado = User.objects.create_user(
            email="egresado@test.com", password="Pass123!", nombres="Juan", apellido_paterno="García", apellido_materno="López", rol="egresado", is_active=True
        )

        # Perfiles
        self.empresa = Empresa.objects.create(
            user=self.u_empresa,
            nombre="Tech Solutions SA",
            domicilio="Calle 1",
            correo_contacto="contacto@tech.com",
            actividad_de_la_empresa="Software",
            giro=self.giro,
            sector=self.sector,
            status="aprobada",
            nombre_contacto="Carlos",
            cargo_contacto="RH"
        )
        self.egresado = Egresado.objects.create(
            user=self.u_egresado,
            matricula="2026001",
            carrera=self.carrera,
            telefono_celular="7711234567"
        )

        # Clientes HTTP
        self.client_admin = APIClient()
        self.client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.admin).access_token}')

        self.client_empresa = APIClient()
        self.client_empresa.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.u_empresa).access_token}')

        self.client_egresado = APIClient()
        self.client_egresado.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.u_egresado).access_token}')

    def test_happy_crear_vacante_con_idiomas(self):
        """HAPPY PATH: Empresa crea vacante válida con lista de idiomas requeridos."""
        payload = {
            "titulo": "Desarrollador Backend Python",
            "tipo_contratacion": "tiempo_completo",
            "modalidad": "presencial",
            "num_candidatos": 2,
            "horario_trabajo": "9:00 a 18:00",
            "nivel_estudios": "ING_LIC",
            "edad": "22 a 35 años",
            "genero": "indistinto",
            "estado_civil": "soltero",
            "es_inclusiva": False,
            "experiencia": "1 año",
            "conocimientos": "Python, Django",
            "habilidades": "REST APIs",
            "actitudes": "Proactivo",
            "responsabilidades": "Desarrollo",
            "sueldo_minimo": "10000.00",
            "sueldo_maximo": "15000.00",
            "salario_a_tratar": False,
            "prestaciones": "Ley",
            "incluye_transporte": False,
            "incluye_comedor": False,
            "documentos_requeridos": "CV",
            "persona_contacto": "Carlos Ruiz",
            "area_estudio": self.area.id,
            "idiomas": [
                {"idioma": self.idioma.id, "nivel": "B2", "obligatorio": True}
            ]
        }

        response = self.client_empresa.post('/api/v1/vacantes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vacante.objects.count(), 1)
        self.assertEqual(RequisitoIdioma.objects.count(), 1)

    def test_sad_path_sueldo_minimo_mayor_que_maximo(self):
        """SAD PATH: Intentar crear vacante con sueldo_minimo > sueldo_maximo rechaza con 400 Bad Request."""
        payload = {
            "titulo": "Vacante Inválida Sueldos",
            "tipo_contratacion": "tiempo_completo",
            "modalidad": "presencial",
            "num_candidatos": 1,
            "horario_trabajo": "9:00 a 18:00",
            "nivel_estudios": "ING_LIC",
            "experiencia": "1 año",
            "conocimientos": "Python",
            "habilidades": "Django",
            "actitudes": "Proactivo",
            "responsabilidades": "APIs",
            "sueldo_minimo": "20000.00",
            "sueldo_maximo": "10000.00",
            "prestaciones": "Ley",
            "documentos_requeridos": "CV",
            "persona_contacto": "Carlos Ruiz",
            "area_estudio": self.area.id,
            "idiomas": []
        }

        response = self.client_empresa.post('/api/v1/vacantes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sueldo", str(response.data))

    def test_happy_postulacion_egresado(self):
        """HAPPY PATH: Egresado se postula correctamente a una vacante."""
        vacante = Vacante.objects.create(
            empresa=self.empresa, area_estudio=self.area, titulo="Dev QA",
            tipo_contratacion="tiempo_completo", modalidad="presencial",
            sueldo_minimo=8000, sueldo_maximo=12000, persona_contacto="Carlos Ruiz"
        )

        response = self.client_egresado.post('/api/v1/vacantes/postulaciones/', {"vacante": vacante.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Postulacion.objects.count(), 1)

    def test_sad_path_postulacion_duplicada(self):
        """SAD PATH: Egresado intenta postularse 2 veces a la misma vacante -> 400 Bad Request."""
        vacante = Vacante.objects.create(
            empresa=self.empresa, area_estudio=self.area, titulo="Dev Mobile",
            tipo_contratacion="tiempo_completo", modalidad="presencial",
            sueldo_minimo=8000, sueldo_maximo=12000, persona_contacto="Carlos Ruiz"
        )
        Postulacion.objects.create(vacante=vacante, egresado=self.egresado)

        response = self.client_egresado.post('/api/v1/vacantes/postulaciones/', {"vacante": vacante.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_happy_colocacion_autosincroniza_egresado_colocado(self):
        """HAPPY PATH: Registrar una colocación cambia automáticamente egresado.colocado a True."""
        vacante = Vacante.objects.create(
            empresa=self.empresa, area_estudio=self.area, titulo="Dev React",
            tipo_contratacion="tiempo_completo", modalidad="presencial",
            sueldo_minimo=8000, sueldo_maximo=12000, persona_contacto="Carlos Ruiz"
        )
        self.assertFalse(self.egresado.colocado)

        payload = {"egresado": self.egresado.id, "vacante": vacante.id}
        response = self.client_admin.post('/api/v1/vacantes/colocaciones/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.egresado.refresh_from_db()
        self.assertTrue(self.egresado.colocado)

    def test_sad_path_rbac_empresa_no_puede_postularse(self):
        """SAD PATH / RBAC: Una Empresa intenta crear una postulación -> 403 Forbidden."""
        vacante = Vacante.objects.create(
            empresa=self.empresa, area_estudio=self.area, titulo="Dev Cloud",
            tipo_contratacion="tiempo_completo", modalidad="presencial",
            sueldo_minimo=8000, sueldo_maximo=12000, persona_contacto="Carlos Ruiz"
        )

        response = self.client_empresa.post('/api/v1/vacantes/postulaciones/', {"vacante": vacante.id})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
