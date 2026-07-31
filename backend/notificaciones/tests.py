from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.models import Giro, Sector, AreaEstudio, Carrera
from profiles.models import Empresa, Egresado
from vacantes.models import Vacante, Postulacion
from events.models import Evento
from notificaciones.utils import enviar_correo_institucional, EmailThread
from django.core.management import call_command
import io

User = get_user_model()


class NotificacionesTestSuite(TestCase):
    """
    Suite de Pruebas exhaustiva para la Fase 3 (Notificaciones):
    Cubre Happy y Sad Paths para Signals (Empresa, Vacante, Postulacion),
    Rastreo de Estado Anterior (pre_save), Batching (BCC en lotes de 50),
    Comandos Cron (resumen_diario para Empresas, resumen_semanal para Egresados, limpieza_inactivos).
    """

    def setUp(self):
        # 1. Crear Estructura Core
        self.giro = Giro.objects.create(nombre="Tecnología")
        self.sector = Sector.objects.create(nombre="Privado")
        self.area = AreaEstudio.objects.create(nombre="Tecnologías de la Información y Comunicación")
        self.carrera = Carrera.objects.create(nombre="Desarrollo de Software", abreviatura="DS", area=self.area)

        # 2. Crear Usuarios
        self.admin = User.objects.create_user(
            email="admin@test.com", password="Pass123!", nombres="Admin", rol="admin_uth", is_active=True
        )
        self.user_empresa = User.objects.create_user(
            email="empresa@test.com", password="Pass123!", nombres="Empresa User", rol="empresa", is_active=True
        )
        self.user_egresado = User.objects.create_user(
            email="egresado@test.com", password="Pass123!", nombres="Juan", apellido_paterno="Pérez", apellido_materno="García", rol="egresado", is_active=True
        )

        # 3. Crear Perfiles
        self.empresa = Empresa.objects.create(
            user=self.user_empresa,
            nombre="Tech Solutions SA",
            domicilio="Calle 1",
            correo_contacto="contacto@techsolutions.com",
            actividad_de_la_empresa="Software",
            giro=self.giro,
            sector=self.sector,
            nombre_contacto="Carlos Ruiz",
            cargo_contacto="RH"
        )
        self.egresado = Egresado.objects.create(
            user=self.user_egresado,
            matricula="2026001",
            carrera=self.carrera,
            telefono_celular="7711234567"
        )

        # Limpiar outbox después del setUp
        self._ejecutar_hilos()
        mail.outbox = []

    def _ejecutar_hilos(self):
        """Helper para asegurar que los EmailThreads se completen antes de aserciones."""
        import threading
        for thread in threading.enumerate():
            if isinstance(thread, EmailThread) and thread.is_alive():
                thread.join(timeout=2)

    # -------------------------------------------------------------------------
    # 1. HAPPY PATHS: SIGNALS E INMEDIATOS (EMPRESA, VACANTE, POSTULACION)
    # -------------------------------------------------------------------------

    def test_happy_signal_nueva_empresa_notifica_admin(self):
        """HAPPY PATH: Al crear una Empresa se notifica al administrador UTH."""
        mail.outbox = []
        user_emp2 = User.objects.create_user(
            email="emp2@test.com", password="Pass123!", nombres="Empresa 2", rol="empresa", is_active=True
        )
        Empresa.objects.create(
            user=user_emp2,
            nombre="Empresa Dos",
            domicilio="Calle 2",
            correo_contacto="emp2@test.com",
            actividad_de_la_empresa="Servicios",
            giro=self.giro,
            sector=self.sector,
            nombre_contacto="Contacto 2",
            cargo_contacto="Director"
        )

        self._ejecutar_hilos()
        self.assertTrue(len(mail.outbox) >= 1)
        ultimo_correo = mail.outbox[-1]
        self.assertIn("Nueva Empresa Registrada", ultimo_correo.subject)
        self.assertIn("admin@test.com", ultimo_correo.to)

    def test_happy_signal_aprobacion_empresa_notifica_empresa(self):
        """HAPPY PATH: Al cambiar estatus de Empresa a 'aprobada', notifica a la Empresa."""
        mail.outbox = []
        self.empresa.status = 'aprobada'
        self.empresa.save()
        self._ejecutar_hilos()

        self.assertTrue(len(mail.outbox) >= 1)
        correo_empresa = mail.outbox[-1]
        self.assertIn("Estatus de Cuenta de Empresa UTH", correo_empresa.subject)
        self.assertIn("contacto@techsolutions.com", correo_empresa.to)

    def test_happy_signal_nueva_vacante_notifica_admin(self):
        """HAPPY PATH: Al crear una Vacante, notifica inmediatamente al Administrador UTH."""
        mail.outbox = []
        Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Nueva Vacante Python",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=10000,
            sueldo_maximo=15000,
            persona_contacto="Carlos Ruiz"
        )
        self._ejecutar_hilos()

        self.assertTrue(len(mail.outbox) >= 1)
        correo_admin = mail.outbox[-1]
        self.assertIn("Nueva Vacante Pendiente de Revisión", correo_admin.subject)
        self.assertIn("admin@test.com", correo_admin.to)

    def test_happy_signal_aprobacion_vacante_notifica_empresa(self):
        """HAPPY PATH: Al cambiar estatus de vacante a 'aprobada', notifica a la empresa."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Desarrollador Django",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=10000,
            sueldo_maximo=15000,
            persona_contacto="Carlos Ruiz"
        )
        self._ejecutar_hilos()
        mail.outbox = []

        # Cambiar estado a aprobada
        vacante.status = 'aprobada'
        vacante.save()
        self._ejecutar_hilos()

        self.assertTrue(len(mail.outbox) >= 1)
        correo_empresa = [m for m in mail.outbox if "Aprobada" in m.subject]
        self.assertEqual(len(correo_empresa), 1)
        self.assertIn("contacto@techsolutions.com", correo_empresa[0].to)

    def test_happy_signal_cambio_estado_postulacion_notifica_egresado(self):
        """HAPPY PATH: Al cambiar estado de postulación a 'Aceptada', notifica al egresado."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Frontend Dev",
            tipo_contratacion="tiempo_completo",
            modalidad="remoto",
            sueldo_minimo=12000,
            sueldo_maximo=18000,
            persona_contacto="Carlos Ruiz"
        )
        postulacion = Postulacion.objects.create(vacante=vacante, egresado=self.egresado)
        self._ejecutar_hilos()
        mail.outbox = []

        # Cambiar estado a Aceptada
        postulacion.estado = 'Aceptada'
        postulacion.save()
        self._ejecutar_hilos()

        self.assertTrue(len(mail.outbox) >= 1)
        correo_post = mail.outbox[-1]
        self.assertIn("Aceptada", correo_post.subject)
        self.assertIn("egresado@test.com", correo_post.to)

    # -------------------------------------------------------------------------
    # 2. PRE_SAVE STATE TRACKING (SAD PATH PREVENCION DE SPAM)
    # -------------------------------------------------------------------------

    def test_sad_path_no_reenvia_correo_si_estatus_empresa_no_cambia(self):
        """SAD PATH / ANTI-SPAM: Editar domicilio de empresa ya aprobada NO reenvía correo."""
        self.empresa.status = 'aprobada'
        self.empresa.save()
        self._ejecutar_hilos()
        mail.outbox = []

        # Editar otro campo
        self.empresa.domicilio = "Nueva Calle 456"
        self.empresa.save()
        self._ejecutar_hilos()

        self.assertEqual(len(mail.outbox), 0)

    def test_sad_path_no_reenvia_correo_si_estatus_vacante_no_cambia(self):
        """SAD PATH / ANTI-SPAM: Editar observaciones de vacante ya aprobada NO reenvía correo."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Dev QA",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=10000,
            sueldo_maximo=15000,
            persona_contacto="Carlos Ruiz"
        )
        vacante.status = 'aprobada'
        vacante.save()
        self._ejecutar_hilos()
        mail.outbox = []

        # Editar otro campo manteniendo el mismo status 'aprobada'
        vacante.observaciones = "Notas actualizadas"
        vacante.save()
        self._ejecutar_hilos()

        self.assertEqual(len(mail.outbox), 0)

    def test_sad_path_no_reenvia_correo_si_estado_postulacion_no_cambia(self):
        """SAD PATH / ANTI-SPAM: Guardar postulación aceptada sin cambiar estado NO reenvía correo."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Dev Mobile",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=10000,
            sueldo_maximo=15000,
            persona_contacto="Carlos Ruiz"
        )
        postulacion = Postulacion.objects.create(vacante=vacante, egresado=self.egresado)
        postulacion.estado = 'Aceptada'
        postulacion.save()
        self._ejecutar_hilos()
        mail.outbox = []

        # Re-guardar postulacion sin modificar estado
        postulacion.save()
        self._ejecutar_hilos()

        self.assertEqual(len(mail.outbox), 0)

    # -------------------------------------------------------------------------
    # 3. BATCHING & PRIVACIDAD (BCC EN LOTES DE 50)
    # -------------------------------------------------------------------------

    def test_happy_batching_envio_masivo_lotes_de_50(self):
        """HAPPY PATH: Enviar correo masivo a 110 egresados genera 3 envíos en lotes de 50 en BCC."""
        mail.outbox = []
        destinatarios = [f"egresado_{i}@test.com" for i in range(110)]

        enviar_correo_institucional(
            subject="Test Masivo",
            template_name="emails/resumen_eventos_egresado.html",
            context={"eventos": []},
            bcc_list=destinatarios,
            is_bulk=True
        )
        self._ejecutar_hilos()

        # 110 destinatarios / 50 = 3 mensajes (50, 50, 10)
        self.assertEqual(len(mail.outbox), 3)

        lote1 = mail.outbox[0]
        lote2 = mail.outbox[1]
        lote3 = mail.outbox[2]

        self.assertEqual(len(lote1.bcc), 50)
        self.assertEqual(len(lote2.bcc), 50)
        self.assertEqual(len(lote3.bcc), 10)

    def test_sad_path_lista_destinatarios_vacia_no_falla(self):
        """SAD PATH: Llamar utilería con listas vacías se maneja limpiamente sin excepciones."""
        mail.outbox = []
        enviar_correo_institucional(
            subject="Test Vacío",
            template_name="emails/base_email.html",
            context={},
            recipient_list=[],
            bcc_list=[]
        )
        self._ejecutar_hilos()
        self.assertEqual(len(mail.outbox), 0)

    # -------------------------------------------------------------------------
    # 4. CRONJOBS (RESUMEN DIARIO EMPRESAS, RESUMEN SEMANAL EGRESADOS & LIMPIEZA)
    # -------------------------------------------------------------------------

    def test_happy_cronjob_resumen_diario_empresa(self):
        """HAPPY PATH: resumen_diario agrupa postulaciones recientes de las últimas 24h para Empresas."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Dev DevOps",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=10000,
            sueldo_maximo=15000,
            persona_contacto="Carlos Ruiz",
            status="aprobada"
        )
        Postulacion.objects.create(vacante=vacante, egresado=self.egresado)
        self._ejecutar_hilos()
        mail.outbox = []

        out = io.StringIO()
        call_command("resumen_diario", stdout=out)
        self._ejecutar_hilos()

        self.assertIn("Resumen Diario", out.getvalue())
        self.assertTrue(len(mail.outbox) >= 1)

    def test_happy_cronjob_resumen_semanal_egresados(self):
        """HAPPY PATH: resumen_semanal agrupa vacantes y eventos de los últimos 7 días para Egresados."""
        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Dev FullStack Python",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=12000,
            sueldo_maximo=18000,
            persona_contacto="Carlos Ruiz",
            status="aprobada"
        )
        Evento.objects.create(
            nombre="Feria Semanal de Empleo UTH",
            tipo_evento="feria_empleo",
            fecha_inicio=timezone.now() + timedelta(days=2),
            fecha_fin=timezone.now() + timedelta(days=2, hours=4),
            lugar="Auditorio UTH",
            descripcion="Reclutamiento directo.",
            is_active=True
        )
        self._ejecutar_hilos()
        mail.outbox = []

        out = io.StringIO()
        call_command("resumen_semanal", stdout=out)
        self._ejecutar_hilos()

        self.assertIn("Resumen Semanal", out.getvalue())
        self.assertTrue(len(mail.outbox) >= 1)

    def test_happy_cronjob_limpieza_inactivos_aviso_y_desactivacion(self):
        """HAPPY PATH & SAD PATH: limpieza_inactivos alerta a los 165 días y desactiva a los 180 días exactos."""
        hoy = timezone.now().date()
        fecha_165 = hoy - timedelta(days=165)
        fecha_180 = hoy - timedelta(days=180)
        fecha_reciente = hoy - timedelta(days=10)

        u_aviso = User.objects.create_user(
            email="aviso@test.com", password="Pass123!", nombres="User Aviso", rol="egresado", is_active=True
        )
        u_desact = User.objects.create_user(
            email="desact@test.com", password="Pass123!", nombres="User Desact", rol="egresado", is_active=True
        )
        u_activo = User.objects.create_user(
            email="activo@test.com", password="Pass123!", nombres="User Activo", rol="egresado", is_active=True
        )

        User.objects.filter(id=u_aviso.id).update(last_login=timezone.make_aware(timezone.datetime.combine(fecha_165, timezone.datetime.min.time())))
        User.objects.filter(id=u_desact.id).update(last_login=timezone.make_aware(timezone.datetime.combine(fecha_180, timezone.datetime.min.time())))
        User.objects.filter(id=u_activo.id).update(last_login=timezone.make_aware(timezone.datetime.combine(fecha_reciente, timezone.datetime.min.time())))

        mail.outbox = []
        out = io.StringIO()
        call_command("limpieza_inactivos", stdout=out)
        self._ejecutar_hilos()

        u_desact.refresh_from_db()
        self.assertFalse(u_desact.is_active)

        u_activo.refresh_from_db()
        self.assertTrue(u_activo.is_active)

        self.assertTrue(len(mail.outbox) >= 2)
