import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from users.models import User
from profiles.models import Empresa, Egresado
from vacantes.models import Vacante, Postulacion
from core.models import Carrera, Giro, Sector
from events.models import Evento
from vacantes.emails import (
    send_postulacion_recibida_email,
    send_postulacion_turnada_email,
    send_candidato_contratado_email,
    send_nueva_vacante_email,
)

RECIPIENT = 'revision_estilos@uth.edu.mx'
FROM_EMAIL = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Bolsa de Trabajo UTH <vinculacion@uth.edu.mx>')

print("=== INICIANDO ENVÍO DE CORREOS DE PRUEBA INSTITUCIONALES UTH ===")

# Objetos de prueba base
demo_user = User.objects.filter(is_superuser=False).first()
if not demo_user:
    demo_user = User.objects.first()

demo_empresa = Empresa.objects.first()
demo_vacante = Vacante.objects.first()
demo_postulacion = Postulacion.objects.first()
demo_carrera = Carrera.objects.first()
demo_evento = Evento.objects.first()

from notificaciones.utils import _attach_uth_logo

def send_test(subject, template_name, context):
    ctx = dict(context or {})
    ctx.setdefault('frontend_url', getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'))
    html_content = render_to_string(template_name, ctx)
    msg = EmailMultiAlternatives(
        subject=subject,
        body="Tu cliente de correo no soporta mensajes en formato HTML.",
        from_email=FROM_EMAIL,
        to=[RECIPIENT]
    )
    msg.attach_alternative(html_content, "text/html")
    _attach_uth_logo(msg)
    msg.send(fail_silently=False)
    print(f" [OK] Enviado: {subject}")

# 1. Activación de cuenta (Djoser)
send_test(
    "1. Activación de tu Cuenta Institucional · EXUTH UTH",
    "email/activation.html",
    {
        "user": demo_user,
        "protocol": "http",
        "domain": "localhost:3000",
        "url": "auth/activate/demo_uid/demo_token/",
    }
)

# 2. Confirmación de cuenta activada (Djoser)
send_test(
    "2. Cuenta Activada Exitosamente · EXUTH UTH",
    "email/confirmation.html",
    {
        "user": demo_user,
        "protocol": "http",
        "domain": "localhost:3000",
    }
)

# 3. Restablecimiento de contraseña (Djoser)
send_test(
    "3. Restablecimiento de Contraseña · EXUTH UTH",
    "email/password_reset.html",
    {
        "user": demo_user,
        "protocol": "http",
        "domain": "localhost:3000",
        "url": "auth/reset-password/demo_uid/demo_token/",
    }
)

# 4. Confirmación de cambio de contraseña (Djoser)
send_test(
    "4. Contraseña Modificada Exitosamente · EXUTH UTH",
    "email/password_changed_confirmation.html",
    {
        "user": demo_user,
        "protocol": "http",
        "domain": "localhost:3000",
    }
)

# 5. Notificación nueva empresa registrada (para Admin UTH)
send_test(
    f"5. [UTH Admin] Nueva Empresa Registrada: {demo_empresa.nombre}",
    "emails/nueva_empresa_admin.html",
    {"empresa": demo_empresa}
)

# 6. Estatus de empresa aprobado / convenio activo
send_test(
    f"6. Estatus de Cuenta de Empresa UTH: {demo_empresa.nombre} - Convenio Activo",
    "emails/empresa_status.html",
    {"empresa": demo_empresa}
)

# 7. Notificación nueva vacante pendiente de revisión (para Admin UTH)
send_test(
    f"7. [UTH Admin] Nueva Vacante Pendiente de Revisión: {demo_vacante.titulo}",
    "emails/nueva_vacante_admin.html",
    {"vacante": demo_vacante, "empresa": demo_empresa}
)

# 8. Estatus de vacante actualizado (para Empresa)
send_test(
    f"8. Estatus de Vacante Actualizado: [{demo_vacante.clave_vacante}] {demo_vacante.titulo} - Aprobada",
    "emails/vacante_status_empresa.html",
    {"vacante": demo_vacante, "empresa": demo_empresa}
)

# 9. Nueva vacante disponible (para Egresado)
send_test(
    f"9. Nueva Oportunidad Laboral UTH: {demo_vacante.titulo} en {demo_empresa.nombre}",
    "emails/nueva_vacante_egresado.html",
    {"vacante": demo_vacante, "empresa": demo_empresa, "user": demo_user}
)

# 10. Nueva postulación recibida (para Empresa)
send_test(
    f"10. Nueva Postulación Recibida para la vacante: {demo_vacante.titulo}",
    "emails/nueva_postulacion_empresa.html",
    {
        "vacante": demo_vacante,
        "empresa": demo_empresa,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 11. Estatus de postulación actualizado (para Egresado)
send_test(
    f"11. Actualización de tu Postulación: {demo_vacante.titulo} - Turnada a Empresa",
    "emails/postulacion_status_egresado.html",
    {
        "vacante": demo_vacante,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 12. Resumen diario de postulaciones (para Empresa)
send_test(
    f"12. Resumen Diario de Candidaturas: 3 nuevas postulaciones en {demo_empresa.nombre}",
    "emails/resumen_diario_empresa.html",
    {
        "empresa": demo_empresa,
        "postulaciones": [demo_postulacion] if demo_postulacion else [],
        "total_postulaciones": 3
    }
)

# 13. Resumen semanal de vacantes (para Egresado)
send_test(
    f"13. Boletín Semanal de Empleo UTH: Vacantes afines a tu formación",
    "emails/resumen_vacantes_egresado.html",
    {
        "area": demo_carrera.area if (demo_carrera and hasattr(demo_carrera, 'area')) else None,
        "vacantes": [demo_vacante]
    }
)

# 14. Resumen de eventos próximos (para Egresado)
send_test(
    f"14. Convocatorias y Eventos Institucionales UTH para Egresados",
    "emails/resumen_eventos_egresado.html",
    {
        "eventos": [demo_evento] if demo_evento else [],
        "user": demo_user
    }
)

# 15. Advertencia de inactividad de cuenta (165 días)
send_test(
    "15. Aviso Importante: Tu cuenta institucional en EXUTH vencerá en 15 días",
    "emails/advertencia_vencimiento_egresado.html",
    {"user": demo_user}
)

# 16. Desactivación preventiva por 6 meses de inactividad
send_test(
    "16. Aviso de Desactivación Preventiva por Inactividad · Bolsa de Trabajo UTH",
    "emails/desactivacion_vencimiento_egresado.html",
    {"user": demo_user}
)

# 17. Postulación recibida (Acuse para Egresado)
send_test(
    f"17. [UTH] Confirmación de Postulación: {demo_vacante.titulo} ({demo_vacante.clave_vacante})",
    "emails/postulacion_recibida_egresado.html",
    {
        "vacante": demo_vacante,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 18. Candidato Turnado por UTH (para Empresa)
send_test(
    f"18. [UTH Vinculación] Candidato Idóneo Turnado: {demo_vacante.titulo} - Carlos García",
    "emails/candidato_turnado_empresa.html",
    {
        "vacante": demo_vacante,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 19. Postulación Turnada a Empresa (para Egresado)
send_test(
    f"19. [UTH Vinculación] ¡Tu postulación fue turnada a {demo_empresa.nombre}!",
    "emails/postulacion_turnada_egresado.html",
    {
        "vacante": demo_vacante,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 20. Candidato Contratado / Colocación Exitosa (para Egresado)
send_test(
    f"20. [UTH Colocación] ¡Felicidades! Postulación Aceptada en {demo_empresa.nombre}",
    "emails/candidato_contratado_egresado.html",
    {
        "vacante": demo_vacante,
        "postulacion": demo_postulacion,
        "egresado": demo_postulacion.egresado if demo_postulacion else None
    }
)

# 21. Postulación no aprobada en Filtro UTH (para Egresado)
if demo_postulacion:
    demo_postulacion.estado = 'rechazada_uth'
    demo_postulacion.notas_uth = 'El perfil no cuenta con la certificación requerida para la posición.'
    send_test(
        f"21. Actualización de Postulación: {demo_vacante.titulo} - Rechazada por UTH",
        "emails/postulacion_status_egresado.html",
        {
            "vacante": demo_vacante,
            "postulacion": demo_postulacion,
            "egresado": demo_postulacion.egresado
        }
    )

print("=== TODOS LOS CORREOS DE PRUEBA FUERON ENVIADOS CON ÉXITO ===")
