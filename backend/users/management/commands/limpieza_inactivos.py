from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from profiles.models import Egresado
from notificaciones.utils import enviar_correo_institucional


class Command(BaseCommand):
    help = (
        "Comando cronjob diario para gestionar aviso preventivo (15 días antes) y paso a estado "
        "inactivo al concluir la vigencia de 6 meses (180 días) de cuentas de egresados."
    )

    def handle(self, *args, **options):
        ahora = timezone.now()
        limite_aviso = ahora + timedelta(days=15)
        contacto_uth = getattr(settings, 'UTH_BOLSA_CC_EMAIL', 'bolsadetrabajo@uth.edu.mx')

        # 1. Fase de Aviso Preventivo: vigencia_hasta dentro de los próximos 15 días (una sola vez)
        egresados_aviso = Egresado.objects.select_related('user').filter(
            activo_bolsa=True,
            user__is_active=True,
            user__deactivated_at__isnull=True,
            aviso_vencimiento_enviado=False,
            vigencia_hasta__gt=ahora,
            vigencia_hasta__lte=limite_aviso,
        )

        total_avisos = 0
        for eg in egresados_aviso:
            eg.aviso_vencimiento_enviado = True
            eg.save(update_fields=['aviso_vencimiento_enviado'])
            if eg.user and eg.user.email:
                enviar_correo_institucional(
                    subject="Aviso: Tu vigencia de 6 meses en la Bolsa de Trabajo UTH está próxima a concluir",
                    template_name='emails/advertencia_vencimiento_egresado.html',
                    context={
                        'user': eg.user,
                        'egresado': eg,
                        'contacto_uth': contacto_uth,
                    },
                    recipient_list=[eg.user.email],
                )
                total_avisos += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Fase de Aviso] Se despacharon {total_avisos} alertas preventivas de vigencia (<= 15 días).")
        )

        # 2. Fase de Vencimiento: vigencia_hasta <= ahora (captura atrasos si el cron no corrió un día)
        egresados_vencidos = Egresado.objects.select_related('user').filter(
            activo_bolsa=True,
            user__is_active=True,
            user__deactivated_at__isnull=True,
            vigencia_hasta__lte=ahora,
        )

        total_desactivados = 0
        for eg in egresados_vencidos:
            eg.activo_bolsa = False
            eg.motivo_inactividad = 'vencimiento'
            eg.save(update_fields=['activo_bolsa', 'motivo_inactividad'])

            if eg.user:
                eg.user.is_active = False
                eg.user.deactivated_at = ahora
                eg.user.save(update_fields=['is_active', 'deactivated_at'])

            if eg.user and eg.user.email:
                enviar_correo_institucional(
                    subject="Notificación: Tu periodo de vigencia de 6 meses en Bolsa de Trabajo UTH ha concluido",
                    template_name='emails/desactivacion_vencimiento_egresado.html',
                    context={
                        'user': eg.user,
                        'egresado': eg,
                        'contacto_uth': contacto_uth,
                    },
                    recipient_list=[eg.user.email],
                )
            total_desactivados += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Fase de Vencimiento] Se inactivaron {total_desactivados} cuentas por vigencia de 6 meses concluida.")
        )
