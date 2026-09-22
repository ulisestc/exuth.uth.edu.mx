from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import AreaEstudio, Carrera, Giro, Sector
from profiles.models import Egresado, Empresa
from vacantes.models import Vacante, Postulacion, Colocacion

User = get_user_model()


class ReportsUnitTestSuite(APITestCase):
    """
    Suite de Pruebas Unitarias para la app 'reports':
    - Dashboard de Business Intelligence con métricas en tiempo real.
    - Exportación a Excel (.xlsx) y PDF (.pdf) de Egresados, Vacantes, Postulaciones y Colocaciones.
    - Control de Acceso por Roles (RBAC): Exclusivo para Departamento de Desempeño de Egresados (admin_uth / soporte_ti).
    """

    def setUp(self):
        self.area = AreaEstudio.objects.create(nombre="Área Tecnológica")
        self.carrera = Carrera.objects.create(nombre="TI", abreviatura="TI", area=self.area)
        self.giro = Giro.objects.create(nombre="Software")
        self.sector = Sector.objects.create(nombre="Privado")

        # Usuarios
        self.admin = User.objects.create_user(
            email="admin_rep@uth.edu.mx", password="password123", rol="admin_uth", is_active=True
        )
        self.u_emp = User.objects.create_user(
            email="emp_rep@test.com", password="password123", rol="empresa", is_active=True
        )
        self.u_egr = User.objects.create_user(
            email="egr_rep@test.com", password="password123", rol="egresado", is_active=True
        )

        self.empresa = Empresa.objects.create(
            user=self.u_emp, nombre="Empresa Test", domicilio="Calle 1", correo_contacto="c@test.com",
            actividad_de_la_empresa="TI", giro=self.giro, sector=self.sector, status="aprobada"
        )
        self.egresado = Egresado.objects.create(
            user=self.u_egr, matricula="REP001", carrera=self.carrera, colocado=True, es_verificado_padron=True
        )
        self.vacante = Vacante.objects.create(
            empresa=self.empresa, area_estudio=self.area, titulo="Dev Python", status="aprobada",
            tipo_contratacion="tiempo_completo", modalidad="presencial", persona_contacto="Contacto"
        )
        self.postulacion = Postulacion.objects.create(
            vacante=self.vacante, egresado=self.egresado, estado="Aceptada"
        )
        self.colocacion = Colocacion.objects.create(
            egresado=self.egresado, vacante=self.vacante, registrado_por=self.admin
        )

        # Clientes HTTP
        self.client_admin = APIClient()
        self.client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.admin).access_token}')

        self.client_empresa = APIClient()
        self.client_empresa.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.u_emp).access_token}')

        self.client_egresado = APIClient()
        self.client_egresado.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.u_egr).access_token}')

    def test_dashboard_stats_ok(self):
        """HAPPY PATH: Dashboard devuelve estadísticas consolidadas a Admin UTH."""
        res = self.client_admin.get('/api/v1/reports/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('egresados', res.data)
        self.assertIn('vacantes', res.data)
        self.assertIn('postulaciones', res.data)
        self.assertEqual(res.data['egresados']['total'], 1)
        self.assertEqual(res.data['egresados']['colocados'], 1)
        self.assertEqual(res.data['egresados']['tasa_colocacion_porcentaje'], 100.0)

    def test_reporte_egresados_formatos(self):
        """HAPPY PATH: Reporte de egresados en JSON, Excel (.xlsx) y PDF."""
        # JSON
        res_json = self.client_admin.get('/api/v1/reports/egresados/')
        self.assertEqual(res_json.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_json.data), 1)

        # Excel
        res_xls = self.client_admin.get('/api/v1/reports/egresados/?format=excel')
        self.assertEqual(res_xls.status_code, status.HTTP_200_OK)
        self.assertIn('spreadsheetml.sheet', res_xls['Content-Type'])
        self.assertIn('.xlsx', res_xls['Content-Disposition'])

        # PDF
        res_pdf = self.client_admin.get('/api/v1/reports/egresados/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)
        self.assertEqual(res_pdf['Content-Type'], 'application/pdf')
        self.assertIn('.pdf', res_pdf['Content-Disposition'])

    def test_reporte_vacantes_excel_y_pdf(self):
        """HAPPY PATH: Reporte de vacantes en Excel y PDF."""
        res_xls = self.client_admin.get('/api/v1/reports/vacantes/?format=excel')
        self.assertEqual(res_xls.status_code, status.HTTP_200_OK)

        res_pdf = self.client_admin.get('/api/v1/reports/vacantes/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)

    def test_reporte_postulaciones_excel_y_pdf(self):
        """HAPPY PATH: Reporte de postulaciones en Excel y PDF."""
        res_xls = self.client_admin.get('/api/v1/reports/postulaciones/?format=excel')
        self.assertEqual(res_xls.status_code, status.HTTP_200_OK)

        res_pdf = self.client_admin.get('/api/v1/reports/postulaciones/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)

    def test_reporte_colocaciones_excel_y_pdf(self):
        """HAPPY PATH: Reporte de colocaciones laborales en Excel y PDF."""
        res_xls = self.client_admin.get('/api/v1/reports/colocaciones/?format=excel')
        self.assertEqual(res_xls.status_code, status.HTTP_200_OK)

        res_pdf = self.client_admin.get('/api/v1/reports/colocaciones/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)

    def test_reporte_empresas_excel_y_pdf(self):
        """HAPPY PATH: Directorio de empresas en Excel y PDF."""
        res_xls = self.client_admin.get('/api/v1/reports/empresas/?format=excel')
        self.assertEqual(res_xls.status_code, status.HTTP_200_OK)

        res_pdf = self.client_admin.get('/api/v1/reports/empresas/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)

    def test_rbac_bloqueo_reportes_a_egresados_y_empresas(self):
        """SAD PATH / RBAC: Egresados y Empresas no tienen acceso a los reportes de la UTH (403 Forbidden)."""
        res_emp = self.client_empresa.get('/api/v1/reports/dashboard/')
        self.assertEqual(res_emp.status_code, status.HTTP_403_FORBIDDEN)

        res_egr = self.client_egresado.get('/api/v1/reports/dashboard/')
        self.assertEqual(res_egr.status_code, status.HTTP_403_FORBIDDEN)
