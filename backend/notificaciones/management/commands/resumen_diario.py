from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from vacantes.models import Vacante, Postulacion
from events.models import Evento
from profiles.models import Egresado
from notificaciones.utils import enviar_correo_institucional


class Command(BaseCommand):
    help = "Comando cronjob diario para procesar y enviar los resúmenes agregados de las últimas 24 horas."

    def handle(self, *args, **options):
        desde = timezone.now() - timedelta(days=1)
        self.stdout.write(self.style.SUCCESS(f"Iniciando Resumen Diario para registros desde {desde.strftime('%Y-%m-%d %H:%M')}..."))

        # 1. Resumen de Postulaciones (Para Empresas)
        postulaciones_recientes = Postulacion.objects.filter(
            fecha_postulacion__gte=desde
        ).select_related('vacante__empresa', 'egresado__user', 'egresado__carrera')

        postulaciones_por_empresa = {}
        for post in postulaciones_recientes:
            empresa = post.vacante.empresa
            postulaciones_por_empresa.setdefault(empresa, []).append(post)

        total_correos_empresas = 0
        for empresa, lista_postulaciones in postulaciones_por_empresa.items():
            destinatarios = [empresa.correo_contacto]
            if empresa.user and empresa.user.email:
                destinatarios.append(empresa.user.email)
            destinatarios = list(set(filter(None, destinatarios)))

            if destinatarios:
                enviar_correo_institucional(
                    subject=f"Resumen Diario: Tienes {len(lista_postulaciones)} nueva(s) postulación(es) hoy",
                    template_name='emails/resumen_diario_empresa.html',
                    context={
                        'empresa': empresa,
                        'postulaciones': lista_postulaciones,
                        'total_postulaciones': len(lista_postulaciones)
                    },
                    recipient_list=destinatarios
                )
                total_correos_empresas += 1

        self.stdout.write(
            self.style.SUCCESS(f"[Empresas] Se enviaron {total_correos_empresas} correos de resumen diario de postulaciones.")
        )

        # 2. Resumen de Vacantes Aprobadas (Para Egresados agrupados por área)
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
                    subject=f"Resumen Diario: {len(lista_vacantes)} nueva(s) vacante(s) en tu área ({area.nombre})",
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
            self.style.SUCCESS(f"[Egresados - Vacantes] Se procesaron {total_resumenes_vacantes} áreas de estudio con nuevas vacantes.")
        )

        # 3. Resumen de Eventos (Para Egresados)
        eventos_recientes = Evento.objects.filter(
            is_active=True,
            fecha_inicio__gte=desde
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
                    subject="Resumen Diario: Nuevos eventos de empleabilidad UTH programados",
                    template_name='emails/resumen_eventos_egresado.html',
                    context={
                        'eventos': eventos_recientes
                    },
                    bcc_list=emails_todos_egresados,
                    is_bulk=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f"[Egresados - Eventos] Se notificó a {len(emails_todos_egresados)} egresados sobre {eventos_recientes.count()} eventos de empleabilidad.")
                )
