from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from vacantes.models import Postulacion
from notificaciones.utils import enviar_correo_institucional


class Command(BaseCommand):
    help = "Comando cronjob diario para procesar y enviar el resumen de candidaturas a Empresas."

    def handle(self, *args, **options):
        desde = timezone.now() - timedelta(days=1)
        self.stdout.write(self.style.SUCCESS(f"Iniciando Resumen Diario para Empresas desde {desde.strftime('%Y-%m-%d %H:%M')}..."))

        # Resumen de Postulaciones (Para Empresas)
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
