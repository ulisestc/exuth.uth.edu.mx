from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from profiles.models import Empresa
from vacantes.models import Vacante, Postulacion
from notificaciones.utils import enviar_correo_institucional

User = get_user_model()


# =========================================================================
# 1. NOTIFICACIONES DE EMPRESA (PRE_SAVE + POST_SAVE)
# =========================================================================

@receiver(pre_save, sender=Empresa)
def capturar_estado_anterior_empresa(sender, instance, **kwargs):
    """Guarda en memoria el estatus anterior de la empresa antes de actualizar en BD."""
    if instance.pk:
        try:
            vieja_empresa = Empresa.objects.get(pk=instance.pk)
            instance._estado_anterior = vieja_empresa.status
        except Empresa.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Empresa)
def notificar_eventos_empresa(sender, instance, created, **kwargs):
    """
    - Si es nueva (created=True): Notifica inmediatamente al Admin UTH.
    - Si cambió estatus a 'aprobada' o 'rechazada': Notifica a la propia Empresa.
    """
    if created:
        # Notificar a administradores UTH sobre el nuevo registro
        admin_emails = list(
            User.objects.filter(rol='admin_uth', is_active=True).values_list('email', flat=True)
        )
        if admin_emails:
            enviar_correo_institucional(
                subject=f"[UTH Admin] Nueva Empresa Registrada: {instance.nombre}",
                template_name='emails/nueva_empresa_admin.html',
                context={'empresa': instance},
                recipient_list=admin_emails
            )
    else:
        estado_anterior = getattr(instance, '_estado_anterior', None)
        if estado_anterior != instance.status and instance.status in ['aprobada', 'rechazada']:
            destinatarios = [instance.correo_contacto]
            if instance.user and instance.user.email:
                destinatarios.append(instance.user.email)
            destinatarios = list(set(filter(None, destinatarios)))

            if destinatarios:
                enviar_correo_institucional(
                    subject=f"Estatus de Cuenta de Empresa UTH: {instance.nombre} - {instance.get_status_display()}",
                    template_name='emails/empresa_status.html',
                    context={'empresa': instance},
                    recipient_list=destinatarios
                )


# =========================================================================
# 2. NOTIFICACIONES DE VACANTE (PRE_SAVE + POST_SAVE)
# =========================================================================

@receiver(pre_save, sender=Vacante)
def capturar_estado_anterior_vacante(sender, instance, **kwargs):
    """Guarda el estado anterior de la vacante en memoria antes del UPDATE."""
    if instance.pk:
        try:
            vieja_vacante = Vacante.objects.get(pk=instance.pk)
            instance._estado_anterior = vieja_vacante.status
        except Vacante.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Vacante)
def notificar_eventos_vacante(sender, instance, created, **kwargs):
    """
    - Si es nueva (created=True): Notifica inmediatamente al Admin UTH para revisión.
    - Si cambió de estatus a 'aprobada' o 'rechazada': Notifica a la Empresa dueña.
    """
    if created:
        admin_emails = list(
            User.objects.filter(rol='admin_uth', is_active=True).values_list('email', flat=True)
        )
        if admin_emails:
            enviar_correo_institucional(
                subject=f"[UTH Admin] Nueva Vacante Pendiente de Revisión: {instance.titulo}",
                template_name='emails/nueva_vacante_admin.html',
                context={
                    'vacante': instance,
                    'empresa': instance.empresa
                },
                recipient_list=admin_emails
            )
    else:
        estado_anterior = getattr(instance, '_estado_anterior', None)
        if estado_anterior != instance.status and instance.status in ['aprobada', 'rechazada']:
            destinatarios_empresa = [instance.empresa.correo_contacto]
            if instance.empresa.user and instance.empresa.user.email:
                destinatarios_empresa.append(instance.empresa.user.email)
            destinatarios_empresa = list(set(filter(None, destinatarios_empresa)))

            if destinatarios_empresa:
                enviar_correo_institucional(
                    subject=f"Estatus de Vacante Actualizado: [{instance.clave_vacante}] {instance.titulo} - {instance.get_status_display()}",
                    template_name='emails/vacante_status_empresa.html',
                    context={
                        'vacante': instance,
                        'empresa': instance.empresa
                    },
                    recipient_list=destinatarios_empresa
                )


# =========================================================================
# 3. NOTIFICACIONES DE POSTULACION (PRE_SAVE + POST_SAVE)
# =========================================================================

@receiver(pre_save, sender=Postulacion)
def capturar_estado_anterior_postulacion(sender, instance, **kwargs):
    """Guarda el estado anterior de la postulación en memoria."""
    if instance.pk:
        try:
            vieja_post = Postulacion.objects.get(pk=instance.pk)
            instance._estado_anterior = vieja_post.estado
        except Postulacion.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Postulacion)
def notificar_eventos_postulacion(sender, instance, created, **kwargs):
    """
    Gestiona todas las notificaciones del ciclo de vida de una Postulación:
    - created=True: Acuse de recibo al Egresado (en revisión/filtro UTH).
    - enviada_empresa: Filtro UTH aprobado. Notifica a la Empresa (candidato turnado)
      y al Egresado (su CV ha sido enviado a la empresa).
    - Aceptada: Candidato contratado por la empresa. Notifica al Egresado con felicitación.
    - rechazada_uth / Rechazada: Filtro no superado o proceso cerrado por empresa.
    """
    if created:
        if instance.egresado.user and instance.egresado.user.email:
            enviar_correo_institucional(
                subject=f"[UTH] Confirmación de Postulación: {instance.vacante.titulo} ({instance.vacante.clave_vacante})",
                template_name='emails/postulacion_recibida_egresado.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=[instance.egresado.user.email]
            )
        return

    estado_anterior = getattr(instance, '_estado_anterior', None)
    if estado_anterior == instance.estado:
        return

    if instance.estado == 'enviada_empresa':
        # 1. Notificar a la Empresa con la ficha del candidato idóneo
        destinatarios_empresa = [instance.vacante.empresa.correo_contacto]
        if instance.vacante.empresa.user and instance.vacante.empresa.user.email:
            destinatarios_empresa.append(instance.vacante.empresa.user.email)
        destinatarios_empresa = list(set(filter(None, destinatarios_empresa)))

        if destinatarios_empresa:
            enviar_correo_institucional(
                subject=f"[UTH Vinculación] Candidato Idóneo Turnado: {instance.vacante.titulo} - {instance.egresado.user.nombres} {instance.egresado.user.apellido_paterno}",
                template_name='emails/candidato_turnado_empresa.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=destinatarios_empresa
            )

        # 2. Notificar al Egresado que su postulación superó el filtro UTH
        if instance.egresado.user and instance.egresado.user.email:
            enviar_correo_institucional(
                subject=f"[UTH Vinculación] ¡Tu postulación fue turnada a {instance.vacante.empresa.nombre}!",
                template_name='emails/postulacion_turnada_egresado.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=[instance.egresado.user.email]
            )

    elif instance.estado == 'Aceptada':
        # Notificar formalmente la contratación al egresado
        if instance.egresado.user and instance.egresado.user.email:
            enviar_correo_institucional(
                subject=f"[UTH Colocación] ¡Felicidades! Postulación Aceptada en {instance.vacante.empresa.nombre}",
                template_name='emails/candidato_contratado_egresado.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=[instance.egresado.user.email]
            )

    elif instance.estado in ['rechazada_uth', 'Rechazada']:
        if instance.egresado.user and instance.egresado.user.email:
            enviar_correo_institucional(
                subject=f"Actualización de Postulación: {instance.vacante.titulo} - {instance.get_estado_display()}",
                template_name='emails/postulacion_status_egresado.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=[instance.egresado.user.email]
            )

