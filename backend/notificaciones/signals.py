from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from profiles.models import Empresa
from vacantes.models import Vacante, Postulacion
from notificaciones.utils import enviar_correo_institucional

User = get_user_model()


# ================= ================= ================= =================
# 1. NOTIFICACIONES DE EMPRESA
# ================= ================= ================= =================

@receiver(post_save, sender=Empresa)
def notificar_nueva_empresa_admin(sender, instance, created, **kwargs):
    """
    Si una Empresa es recién creada (created=True), notifica inmediatamente a los administradores UTH.
    """
    if created:
        admin_emails = list(
            User.objects.filter(
                rol='admin_uth',
                is_active=True
            ).values_list('email', flat=True)
        )
        if admin_emails:
            enviar_correo_institucional(
                subject=f"[UTH Admin] Nueva Empresa Registrada: {instance.nombre}",
                template_name='emails/nueva_empresa_admin.html',
                context={'empresa': instance},
                recipient_list=admin_emails
            )


# ================= ================= ================= =================
# 2. NOTIFICACIONES DE VACANTE (PRE_SAVE + POST_SAVE)
# ================= ================= ================= =================

@receiver(pre_save, sender=Vacante)
def capturar_estado_anterior_vacante(sender, instance, **kwargs):
    """Guarda el estado anterior en memoria antes de hacer el UPDATE en la BD."""
    if instance.pk:  # Si ya existe en la BD (no es nueva)
        try:
            vieja_vacante = Vacante.objects.get(pk=instance.pk)
            instance._estado_anterior = vieja_vacante.status
        except Vacante.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Vacante)
def notificar_estatus_vacante_empresa(sender, instance, created, **kwargs):
    """
    Notifica a la Empresa dueña SOLO cuando la Vacante cambió de estatus a 'aprobada' o 'rechazada'.
    """
    estado_anterior = getattr(instance, '_estado_anterior', None)

    # El condicional maestro: Solo enviamos si NO es nueva, si el estado CAMBIÓ, y si el nuevo estado es aprobada/rechazada
    if not created and estado_anterior != instance.status and instance.status in ['aprobada', 'rechazada']:
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


# ================= ================= ================= =================
# 3. NOTIFICACIONES DE POSTULACION (PRE_SAVE + POST_SAVE)
# ================= ================= ================= =================

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
def notificar_estatus_postulacion_egresado(sender, instance, created, **kwargs):
    """
    Notifica al Egresado SOLO cuando el estado de la postulación CAMBIÓ a 'Aceptada' o 'Rechazada'.
    """
    estado_anterior = getattr(instance, '_estado_anterior', None)

    # Validamos que hubo un cambio real de estado
    if not created and estado_anterior != instance.estado and instance.estado in ['Aceptada', 'Rechazada']:
        if instance.egresado.user and instance.egresado.user.email:
            enviar_correo_institucional(
                subject=f"Actualización de Postulación: {instance.vacante.titulo} - {instance.estado}",
                template_name='emails/postulacion_status_egresado.html',
                context={
                    'postulacion': instance,
                    'vacante': instance.vacante,
                    'egresado': instance.egresado
                },
                recipient_list=[instance.egresado.user.email]
            )
