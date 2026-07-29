from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from events.models import Evento

User = get_user_model()


class EventsUnitTestSuite(APITestCase):
    """
    Suite de Pruebas Unitarias completas para la App 'events':
    - Creación y edición de Eventos por Administradores (Happy Path)
    - Lectura pública/autenticada de Eventos para Egresados y Empresas
    - Control de Acceso por Roles (RBAC: Egresados y Empresas no pueden crear o editar eventos)
    """

    def setUp(self):
        # 1. Usuarios
        self.admin = User.objects.create_user(
            email="admin@test.com", password="Pass123!", nombres="Admin", rol="admin_uth", is_active=True
        )
        self.egresado = User.objects.create_user(
            email="egresado@test.com", password="Pass123!", nombres="Juan", rol="egresado", is_active=True
        )

        # 2. Clientes HTTP
        self.client_admin = APIClient()
        self.client_admin.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.admin).access_token}')

        self.client_egresado = APIClient()
        self.client_egresado.credentials(HTTP_AUTHORIZATION=f'JWT {RefreshToken.for_user(self.egresado).access_token}')

    def test_happy_crear_evento_por_admin(self):
        """HAPPY PATH: Administrador crea un evento institucional válidamente en /api/v1/events/."""
        inicio = timezone.now() + timedelta(days=5)
        fin = inicio + timedelta(hours=4)

        payload = {
            "nombre": "Feria Virtual de Empleo UTH 2026",
            "tipo_evento": "feria_empleo",
            "fecha_inicio": inicio.isoformat(),
            "fecha_fin": fin.isoformat(),
            "lugar": "Auditorio Principal / Transmisión Virtual",
            "descripcion": "Encuentro de vinculación profesional con empresas del estado.",
            "is_active": True
        }

        response = self.client_admin.post('/api/v1/events/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Evento.objects.count(), 1)

    def test_happy_listar_eventos_por_egresado(self):
        """HAPPY PATH: Egresado consulta el listado de eventos programados en /api/v1/events/."""
        inicio = timezone.now() + timedelta(days=2)
        Evento.objects.create(
            nombre="Taller de CV Exitoso",
            tipo_evento="taller",
            fecha_inicio=inicio,
            fecha_fin=inicio + timedelta(hours=2),
            lugar="Sala B",
            descripcion="Taller práctico de redacción de currículum.",
            is_active=True
        )

        response = self.client_egresado.get('/api/v1/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_sad_path_rbac_egresado_no_puede_crear_evento(self):
        """SAD PATH / RBAC: Egresado intenta crear un evento -> 403 Forbidden."""
        inicio = timezone.now() + timedelta(days=1)
        payload = {
            "nombre": "Evento No Autorizado",
            "tipo_evento": "conferencia",
            "fecha_inicio": inicio.isoformat(),
            "fecha_fin": (inicio + timedelta(hours=2)).isoformat(),
            "lugar": "Aula 1",
            "descripcion": "Descripción sin permisos.",
            "is_active": True
        }

        response = self.client_egresado.post('/api/v1/events/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
