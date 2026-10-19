"""
Módulo de compatibilidad para envío de correos relacionados con Vacantes y Postulaciones.
NOTA DE ARQUITECTURA: Todas las notificaciones institucionales son despachadas automáticamente
mediante señales en la app 'notificaciones' (notificaciones/signals.py) y plantillas en
notificaciones/templates/emails/.

Este módulo se conserva para compatibilidad regresiva con tareas programadas o scripts de prueba.
"""
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from notificaciones.utils import enviar_correo_institucional

logger = logging.getLogger(__name__)
User = get_user_model()


def send_postulacion_recibida_email(postulacion):
    """
    Notifica al egresado que su postulación ha sido registrada con éxito y entra al filtro UTH.
    (Delegado a la app 'notificaciones').
    """
    try:
        user = postulacion.egresado.user
        if not user.email:
            return False

        enviar_correo_institucional(
            subject=f"[UTH] Confirmación de Postulación: {postulacion.vacante.titulo} ({postulacion.vacante.clave_vacante})",
            template_name='emails/postulacion_recibida_egresado.html',
            context={
                'postulacion': postulacion,
                'vacante': postulacion.vacante,
                'egresado': postulacion.egresado
            },
            recipient_list=[user.email]
        )
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de postulación recibida: {str(e)}")
        return False


def send_postulacion_turnada_email(postulacion):
    """
    Notifica a la empresa (candidato turnado) y al egresado (postulación aprobada por UTH).
    (Delegado a la app 'notificaciones').
    """
    try:
        egresado = postulacion.egresado
        user_egresado = egresado.user
        vacante = postulacion.vacante
        empresa = vacante.empresa

        # 1. Empresa
        destinatarios_empresa = [empresa.correo_contacto]
        if empresa.user and empresa.user.email:
            destinatarios_empresa.append(empresa.user.email)
        destinatarios_empresa = list(set(filter(None, destinatarios_empresa)))

        if destinatarios_empresa:
            enviar_correo_institucional(
                subject=f"[UTH Vinculación] Candidato Idóneo Turnado: {vacante.titulo} - {user_egresado.nombres} {user_egresado.apellido_paterno}",
                template_name='emails/candidato_turnado_empresa.html',
                context={
                    'postulacion': postulacion,
                    'vacante': vacante,
                    'egresado': egresado
                },
                recipient_list=destinatarios_empresa
            )

        # 2. Egresado
        if user_egresado.email:
            enviar_correo_institucional(
                subject=f"[UTH Vinculación] ¡Tu postulación fue turnada a {empresa.nombre}!",
                template_name='emails/postulacion_turnada_egresado.html',
                context={
                    'postulacion': postulacion,
                    'vacante': vacante,
                    'egresado': egresado
                },
                recipient_list=[user_egresado.email]
            )
        return True
    except Exception as e:
        logger.error(f"Error enviando correos de postulación turnada: {str(e)}")
        return False


def send_candidato_contratado_email(postulacion):
    """
    Notifica al egresado de su contratación formal y registro de colocación universitaria.
    (Delegado a la app 'notificaciones').
    """
    try:
        user = postulacion.egresado.user
        if not user.email:
            return False

        enviar_correo_institucional(
            subject=f"[UTH Colocación] ¡Felicidades! Postulación Aceptada en {postulacion.vacante.empresa.nombre}",
            template_name='emails/candidato_contratado_egresado.html',
            context={
                'postulacion': postulacion,
                'vacante': postulacion.vacante,
                'egresado': postulacion.egresado
            },
            recipient_list=[user.email]
        )
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de contratación: {str(e)}")
        return False


def send_nueva_vacante_email(vacante):
    """
    Notifica a Vinculación UTH (admin_uth) que una empresa registró una vacante para su auditoría.
    (Delegado a la app 'notificaciones').
    """
    try:
        admin_emails = list(
            User.objects.filter(rol='admin_uth', is_active=True).values_list('email', flat=True)
        )
        if not admin_emails:
            admin_emails = ['vinculacion@uth.edu.mx']

        enviar_correo_institucional(
            subject=f"[UTH Admin] Nueva Vacante Pendiente de Revisión: {vacante.titulo}",
            template_name='emails/nueva_vacante_admin.html',
            context={
                'vacante': vacante,
                'empresa': vacante.empresa
            },
            recipient_list=admin_emails
        )
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de nueva vacante: {str(e)}")
        return False
