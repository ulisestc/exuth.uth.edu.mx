from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from vacantes.models import Vacante
from events.models import Evento
from profiles.models import Egresado
from notificaciones.utils import enviar_correo_institucional


class Command(BaseCommand):
    help = "Comando cronjob semanal (ej. cada Lunes a las 8:00 AM) para enviar el boletín de empleo y eventos a egresados."

    def handle(self, *args, **options):
        desde = timezone.now() - timedelta(days=7)
        self.stdout.write(self.style.SUCCESS(f"Iniciando Resumen Semanal de Empleabilidad UTH para registros desde {desde.strftime('%Y-%m-%d %H:%M')}..."))

        # 1. Vacantes Aprobadas en los últimos 7 días agrupadas por área de estudio
        vacantes_aprobadas_recientes = Vacante.objects.filter(
            status='aprobada',
            fecha_registro__gte=desde
        ).select_related('area_estudio', 'empresa')

        vacantes_por_area = {}
        for vac in vacantes_aprobadas_recientes:
            if vac.area_estudio:
                vacantes_por_area.setdefault(vac.area_estudio, []).append(vac)

        total_resumenes_vacantes = 0
        for area, lista_vacantes in vacantes_por_area.items():
            emails_egresados = list(
                Egresado.objects.filter(
                    carrera__area=area,
                    user__is_active=True,
                    user__deactivated_at__isnull=True
                ).values_list('user__email', flat=True)
            )
            emails_egresados = list(set(filter(None, emails_egresados)))
            if emails_egresados:
                enviar_correo_institucional(
                    subject=f"Boletín Semanal de Empleo UTH: {len(lista_vacantes)} nueva(s) vacante(s) en tu área ({area.nombre})",
                    template_name='emails/resumen_vacantes_egresado.html',
                    context={
                        'area': area,
                        'vacantes': lista_vacantes
                    },
                    bcc_list=emails_egresados,
                    is_bulk=True
                )
                total_resumenes_vacantes += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Egresados - Vacantes Semanales] Se procesaron {total_resumenes_vacantes} áreas de estudio con nuevas vacantes.")
        )

        # 2. Eventos programados próximos en los siguientes días
        eventos_recientes = Evento.objects.filter(
            is_active=True,
            fecha_inicio__gte=timezone.now() - timedelta(days=1)
        )

        if eventos_recientes.exists():
            emails_todos_egresados = list(
                Egresado.objects.filter(
                    user__is_active=True,
                    user__deactivated_at__isnull=True
                ).values_list('user__email', flat=True)
            )
            emails_todos_egresados = list(set(filter(None, emails_todos_egresados)))
            if emails_todos_egresados:
                enviar_correo_institucional(
                    subject="Agenda Semanal UTH: Próximos eventos de empleabilidad y talleres",
                    template_name='emails/resumen_eventos_egresado.html',
                    context={
                        'eventos': eventos_recientes
                    },
                    bcc_list=emails_todos_egresados,
                    is_bulk=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f"[Egresados - Eventos Semanales] Se notificó a {len(emails_todos_egresados)} egresados sobre {eventos_recientes.count()} eventos de empleabilidad.")
                )
