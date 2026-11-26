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
            status="pendiente",
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

    def test_happy_signal_nueva_empresa_confirma_empresa_y_notifica_admin(self):
        """TARJETA #13: Al crear una Empresa se confirma a la Empresa (sin cláusula de egresado) y se alerta al Admin UTH."""
        mail.outbox = []
        user_emp2 = User.objects.create_user(
            email="emp2@test.com", password="Pass123!", nombres="Empresa 2", rol="empresa", is_active=True
        )
        Empresa.objects.create(
            user=user_emp2,
            nombre="Empresa Dos",
            domicilio="Calle 2",
            correo_contacto="contacto_emp2@test.com",
            actividad_de_la_empresa="Servicios",
            giro=self.giro,
            sector=self.sector,
            nombre_contacto="Contacto 2",
            cargo_contacto="Director"
        )

        self._ejecutar_hilos()
        correos_admin = [m for m in mail.outbox if "Nueva Empresa Registrada" in m.subject]
        correos_empresa = [m for m in mail.outbox if "Confirmación de Registro Empresarial" in m.subject]

        self.assertEqual(len(correos_admin), 1)
        self.assertIn("admin@test.com", correos_admin[0].to)

        self.assertEqual(len(correos_empresa), 1)
        self.assertIn("contacto_emp2@test.com", correos_empresa[0].to)
        self.assertIn("emp2@test.com", correos_empresa[0].to)
        html_emp = correos_empresa[0].alternatives[0][0]
        self.assertNotIn("UTH-VN-DDE-F-DSBT/01", html_emp)
        self.assertNotIn("Tu vigencia es de 6 meses a partir de esta fecha", html_emp)

    def test_happy_signal_nuevo_egresado_envia_folio_clausula_y_notifica_admin(self):
        """TARJETA #13: Registro de egresado asigna folio consecutivo único, envía cláusula oficial y notifica a Admin UTH."""
        mail.outbox = []
        u_eg2 = User.objects.create_user(
            email="egresado2@test.com",
            password="SecretPassword99!",
            nombres="María",
            apellido_paterno="Hernández",
            apellido_materno="Soto",
            rol="egresado",
            is_active=True,
        )
        eg2 = Egresado.objects.create(
            user=u_eg2,
            matricula="2026999",
            curp="HESM010101MPLRRA09",
            carrera=self.carrera,
            telefono_celular="2221234567",
            domicilio="Huejotzingo",
            genero="F",
            habilidades="Django, Next.js",
        )

        self._ejecutar_hilos()
        self.assertIsNotNone(eg2.folio_bolsa)
        self.assertGreater(eg2.folio_bolsa, self.egresado.folio_bolsa)

        correos_eg = [m for m in mail.outbox if f"Folio #{eg2.folio_bolsa}" in m.subject and "egresado2@test.com" in m.to]
        correos_admin = [m for m in mail.outbox if "Nuevo Egresado Registrado" in m.subject and "admin@test.com" in m.to]

        self.assertEqual(len(correos_eg), 1)
        self.assertEqual(len(correos_admin), 1)

        html_eg = correos_eg[0].alternatives[0][0]
        self.assertIn("Este usuario y contraseña son de uso personal y quedan bajo tu responsabilidad", html_eg)
        self.assertIn("Tu vigencia es de 6 meses a partir de esta fecha", html_eg)
        self.assertIn("UTH-VN-DDE-F-DSBT/01", html_eg)
        self.assertNotIn("SecretPassword99!", html_eg)

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
            status="aprobada"
        )
        Postulacion.objects.create(vacante=vacante, egresado=self.egresado, estado='enviada_empresa')

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
        """TARJETA #14: limpieza_inactivos envía aviso único <= 15 días antes e inactiva con vigencia_hasta <= ahora (incluso con atraso)."""
        ahora = timezone.now()

        u_aviso = User.objects.create_user(
            email="aviso@test.com", password="Pass123!", nombres="User Aviso", rol="egresado", is_active=True
        )
        eg_aviso = Egresado.objects.create(
            user=u_aviso,
            matricula="2026165",
            curp="AVIS010101HPLRRA01",
            carrera=self.carrera,
            telefono_celular="2221111111",
            domicilio="Huejotzingo",
            genero="M",
            habilidades="Python",
            vigencia_hasta=ahora + timedelta(days=10),
        )

        u_vencido = User.objects.create_user(
            email="desact@test.com", password="Pass123!", nombres="User Desact", rol="egresado", is_active=True
        )
        eg_vencido = Egresado.objects.create(
            user=u_vencido,
            matricula="2026185",
            curp="VENC010101HPLRRA02",
            carrera=self.carrera,
            telefono_celular="2222222222",
            domicilio="Huejotzingo",
            genero="M",
            habilidades="Python",
            vigencia_hasta=ahora - timedelta(days=5),
        )

        u_activo = User.objects.create_user(
            email="activo@test.com", password="Pass123!", nombres="User Activo", rol="egresado", is_active=True
        )
        eg_activo = Egresado.objects.create(
            user=u_activo,
            matricula="2026010",
            curp="ACTI010101HPLRRA03",
            carrera=self.carrera,
            telefono_celular="2223333333",
            domicilio="Huejotzingo",
            genero="M",
            habilidades="Python",
            vigencia_hasta=ahora + timedelta(days=170),
        )

        self._ejecutar_hilos()
        mail.outbox = []

        out = io.StringIO()
        call_command("limpieza_inactivos", stdout=out)
        self._ejecutar_hilos()

        eg_aviso.refresh_from_db()
        self.assertTrue(eg_aviso.activo_bolsa)
        self.assertTrue(eg_aviso.aviso_vencimiento_enviado)

        eg_vencido.refresh_from_db()
        u_vencido.refresh_from_db()
        self.assertFalse(eg_vencido.activo_bolsa)
        self.assertEqual(eg_vencido.motivo_inactividad, 'vencimiento')
        self.assertFalse(u_vencido.is_active)
        self.assertIsNotNone(u_vencido.deactivated_at)

        eg_activo.refresh_from_db()
        self.assertTrue(eg_activo.activo_bolsa)

        self.assertEqual(len(mail.outbox), 2)

        # Ejecutar por segunda vez el mismo día NO debe volver a enviar correos duplicados
        mail.outbox = []
        call_command("limpieza_inactivos", stdout=io.StringIO())
        self._ejecutar_hilos()
        self.assertEqual(len(mail.outbox), 0)

        # Blindaje en tiempo real en login: si una cuenta vence antes de correr el cron, bloquea al instante con motivo 'vencimiento'
        from rest_framework.test import APIClient
        Egresado.objects.filter(pk=eg_activo.pk).update(vigencia_hasta=ahora - timedelta(minutes=5))
        res_login_vencido = APIClient().post('/api/v1/auth/jwt/create/', {
            'email': 'activo@test.com',
            'password': 'Pass123!',
        })
        self.assertEqual(res_login_vencido.status_code, 403)
        self.assertEqual(res_login_vencido.data['motivo_inactividad'], 'vencimiento')
        u_activo.refresh_from_db()
        self.assertFalse(u_activo.is_active)

    # -------------------------------------------------------------------------
    # 5. CORREO OFICIAL DE TURNADO DE CV A EMPRESA (TARJETA #11)
    # -------------------------------------------------------------------------

    def test_happy_turnado_cv_oficial_con_cc_y_pdf_adjunto(self):
        """TARJETA #11: Aprobar filtro UTH envía asunto/cuerpo oficial, CC institucional y CV PDF adjunto."""
        import shutil
        import tempfile
        from django.test import override_settings
        from django.core.files.uploadedfile import SimpleUploadedFile

        temp_media = tempfile.mkdtemp()
        try:
            with override_settings(MEDIA_ROOT=temp_media):
                cv_bytes = b"%PDF-1.4 contenido oficial cv egresado"
                self.egresado.cv = SimpleUploadedFile("mi_cv.pdf", cv_bytes, content_type="application/pdf")
                self.egresado.save()

                vacante = Vacante.objects.create(
                    empresa=self.empresa,
                    area_estudio=self.area,
                    titulo="Ingeniero de Procesos",
                    tipo_contratacion="tiempo_completo",
                    modalidad="presencial",
                    sueldo_minimo=18000,
                    sueldo_maximo=20000,
                    persona_contacto="Lic. Rebeca Cortes",
                    entrevistador="Lic. Rebeca Cortes",
                    status="aprobada",
                )
                postulacion = Postulacion.objects.create(vacante=vacante, egresado=self.egresado)
                self._ejecutar_hilos()
                mail.outbox = []

                postulacion.estado = 'enviada_empresa'
                postulacion.save()
                self._ejecutar_hilos()

                folio = getattr(self.egresado, 'folio_bolsa', None) or self.egresado.id
                asunto_esperado = f"Envío de curriculum vitae UTH {folio}, interesado en la vacante: INGENIERO DE PROCESOS."

                correos_empresa = [m for m in mail.outbox if m.subject == asunto_esperado]
                self.assertEqual(len(correos_empresa), 1)
                correo = correos_empresa[0]

                # Validar destinatario y CC institucional
                self.assertIn("contacto@techsolutions.com", correo.to)
                self.assertIn("bolsadetrabajo@uth.edu.mx", correo.cc)

                # Validar cuerpo HTML oficial
                html_body = correo.alternatives[0][0]
                self.assertIn("LIC. REBECA CORTES:", html_body)
                self.assertIn("le hacemos llegar un currículum de un(a) egresado(a) interesado(a) en la vacante de:", html_body)
                self.assertIn("INGENIERO DE PROCESOS", html_body)
                self.assertIn("P.D. Favor de confirmar la recepción de este correo.", html_body)
                self.assertIn("DEPARTAMENTO DE DESEMPEÑO DE EGRESADOS", html_body)

                # Validar PDF del CV adjunto
                pdf_adjuntos = [
                    att for att in correo.attachments
                    if isinstance(att, tuple) and att[0] == f"{folio}.pdf"
                ]
                self.assertEqual(len(pdf_adjuntos), 1)
                self.assertEqual(pdf_adjuntos[0][1], cv_bytes)
                self.assertEqual(pdf_adjuntos[0][2], "application/pdf")
        finally:
            shutil.rmtree(temp_media, ignore_errors=True)

    def test_sad_path_turnado_cv_faltante_en_disco_no_interrumpe(self):
        """TARJETA #11: Si el archivo físico del CV falta en disco, se registra el warning sin interrumpir el flujo."""
        Egresado.objects.filter(pk=self.egresado.pk).update(cv="egresados/cvs/archivo_inexistente_999.pdf")
        self.egresado.refresh_from_db()

        vacante = Vacante.objects.create(
            empresa=self.empresa,
            area_estudio=self.area,
            titulo="Ingeniero Industrial",
            tipo_contratacion="tiempo_completo",
            modalidad="presencial",
            sueldo_minimo=15000,
            sueldo_maximo=18000,
            persona_contacto="Lic. Laura Flores",
            status="aprobada",
        )
        postulacion = Postulacion.objects.create(vacante=vacante, egresado=self.egresado)
        self._ejecutar_hilos()
        mail.outbox = []

        with self.assertLogs('notificaciones.signals', level='WARNING') as cm:
            postulacion.estado = 'enviada_empresa'
            postulacion.save()

        self._ejecutar_hilos()

        self.assertTrue(any("No se pudo leer el archivo físico del CV" in msg for msg in cm.output))
        folio = getattr(self.egresado, 'folio_bolsa', None) or self.egresado.id
        correos_empresa = [m for m in mail.outbox if f"Envío de curriculum vitae UTH {folio}" in m.subject]
        self.assertEqual(len(correos_empresa), 1)
        pdf_adjuntos = [att for att in correos_empresa[0].attachments if isinstance(att, tuple)]
        self.assertEqual(len(pdf_adjuntos), 0)
