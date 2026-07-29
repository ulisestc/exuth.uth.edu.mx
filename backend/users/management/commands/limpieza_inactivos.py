from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from notificaciones.utils import enviar_correo_institucional

User = get_user_model()


class Command(BaseCommand):
    help = "Comando cronjob diario para gestionar advertencia (165 días / 5.5 meses) y desactivación (180 días / 6 meses) por inactividad de egresados."

    def handle(self, *args, **options):
        hoy = timezone.now().date()
        fecha_aviso = hoy - timedelta(days=165)
        fecha_desactivacion = hoy - timedelta(days=180)

        # 1. Fase de Aviso: Usuarios egresados activos cuyo last_login sea de hace exactamente 165 días
        usuarios_aviso = User.objects.filter(
            rol='egresado',
            is_active=True,
            last_login__date=fecha_aviso
        )

        total_avisos = 0
        for user in usuarios_aviso:
            if user.email:
                enviar_correo_institucional(
                    subject="Aviso: Tu cuenta en la Bolsa de Trabajo UTH vencerá en 15 días",
                    template_name='emails/advertencia_vencimiento_egresado.html',
                    context={'user': user},
                    recipient_list=[user.email]
                )
                total_avisos += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Fase de Aviso] Se despacharon {total_avisos} alertas de vencimiento (165 días de inactividad).")
        )

        # 2. Fase de Desactivación: Usuarios egresados activos cuyo last_login sea de hace exactamente 180 días
        usuarios_desactivar = User.objects.filter(
            rol='egresado',
            is_active=True,
            last_login__date=fecha_desactivacion
        )

        total_desactivados = 0
        ahora = timezone.now()
        for user in usuarios_desactivar:
            user.is_active = False
            user.deactivated_at = ahora
            user.save(update_fields=['is_active', 'deactivated_at'])

            if user.email:
                enviar_correo_institucional(
                    subject="Notificación: Tu cuenta en la Bolsa de Trabajo UTH ha sido desactivada",
                    template_name='emails/desactivacion_vencimiento_egresado.html',
                    context={'user': user},
                    recipient_list=[user.email]
                )
                total_desactivados += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Fase de Desactivación] Se desactivaron {total_desactivados} usuarios (180 días de inactividad).")
        )
