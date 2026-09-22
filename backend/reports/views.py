from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, exceptions
from django.db.models import Count, Q
from django.utils import timezone

from profiles.models import Egresado, Empresa, PadronEgresado
from vacantes.models import Vacante, Postulacion, Colocacion
from core.models import Carrera, AreaEstudio, Giro, Sector
from .services import exportar_excel, exportar_pdf

class BaseAdminReportView(APIView):
    """Clase base con control estricto RBAC (Solo admin_uth, soporte_ti y superusuarios)."""
    permission_classes = [IsAuthenticated]

    def perform_content_negotiation(self, request, force=False):
        # Permite usar ?format=excel y ?format=pdf sin que DRF lance Http404
        renderers = self.get_renderers()
        return (renderers[0], renderers[0].media_type)

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.rol not in ['admin_uth', 'soporte_ti'] and not request.user.is_superuser:
            raise exceptions.PermissionDenied("Acceso exclusivo al Departamento de Desempeño de Egresados UTH.")




class DashboardStatsView(BaseAdminReportView):
    """
    Métricas e indicadores en tiempo real para el Dashboard de Inteligencia de Negocios en Angular.
    """
    def get(self, request):
        # 1. Métricas de Egresados
        total_egresados = Egresado.objects.count()
        egresados_verificados = Egresado.objects.filter(es_verificado_padron=True).count()
        egresados_colocados = Egresado.objects.filter(colocado=True).count()
        tasa_colocacion = round((egresados_colocados / total_egresados * 100), 2) if total_egresados > 0 else 0.0

        # 2. Métricas de Empresas y Vacantes
        total_empresas = Empresa.objects.count()
        empresas_con_vacantes = Empresa.objects.filter(vacantes__status='aprobada').distinct().count()

        vacantes_stats = Vacante.objects.aggregate(
            total=Count('id'),
            aprobadas=Count('id', filter=Q(status='aprobada')),
            pendientes=Count('id', filter=Q(status='pendiente')),
            cerradas=Count('id', filter=Q(status='cerrada')),
            inclusivas=Count('id', filter=Q(es_inclusiva=True))
        )

        # 3. Métricas de Postulaciones (Filtro UTH)
        postulaciones_stats = Postulacion.objects.aggregate(
            total=Count('id'),
            en_revision_uth=Count('id', filter=Q(estado='revision_uth')),
            rechazadas_uth=Count('id', filter=Q(estado='rechazada_uth')),
            enviadas_empresa=Count('id', filter=Q(estado='enviada_empresa')),
            aceptadas=Count('id', filter=Q(estado='Aceptada')),
            rechazadas_empresa=Count('id', filter=Q(estado='Rechazada'))
        )

        # 4. Colocaciones por Carrera
        colocaciones_por_carrera = list(
            Colocacion.objects.values('egresado__carrera__nombre')
            .annotate(total=Count('id'))
            .order_by('-total')[:10]
        )

        # 5. Colocaciones por Nivel de Estudios
        colocaciones_por_nivel = list(
            Colocacion.objects.values('egresado__nivel_estudios')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        return Response({
            'egresados': {
                'total': total_egresados,
                'verificados_padron': egresados_verificados,
                'colocados': egresados_colocados,
                'tasa_colocacion_porcentaje': tasa_colocacion,
            },
            'empresas': {
                'total': total_empresas,
                'con_vacantes_activas': empresas_con_vacantes
            },
            'vacantes': vacantes_stats,
            'postulaciones': postulaciones_stats,
            'colocaciones_destacadas': {
                'por_carrera': colocaciones_por_carrera,
                'por_nivel': colocaciones_por_nivel
            }
        }, status=status.HTTP_200_OK)


class ReporteEgresadosView(BaseAdminReportView):
    """Reporte analítico de egresados con filtros y exportación a Excel y PDF."""
    def get(self, request):
        fmt = request.query_params.get('format', 'json').lower()
        qs = Egresado.objects.select_related('user', 'carrera').all()

        # Filtros opcionales
        carrera_id = request.query_params.get('carrera')
        if carrera_id:
            qs = qs.filter(carrera_id=carrera_id)
        nivel = request.query_params.get('nivel')
        if nivel:
            qs = qs.filter(nivel_estudios=nivel)
        genero = request.query_params.get('genero')
        if genero:
            qs = qs.filter(genero=genero)
        colocado = request.query_params.get('colocado')
        if colocado is not None:
            qs = qs.filter(colocado=(colocado.lower() in ['true', '1']))
        verificado = request.query_params.get('verificado')
        if verificado is not None:
            qs = qs.filter(es_verificado_padron=(verificado.lower() in ['true', '1']))

        columnas = ['Matrícula', 'Nombre Completo', 'Correo', 'Carrera', 'Nivel', 'Género', 'Teléfono', 'Colocado', 'Padrón']
        filas = []
        for e in qs:
            filas.append([
                e.matricula,
                f"{e.user.nombres} {e.user.apellido_paterno} {e.user.apellido_materno}",
                e.user.email,
                e.carrera.nombre if e.carrera else '-',
                e.get_nivel_estudios_display() if hasattr(e, 'get_nivel_estudios_display') else e.nivel_estudios,
                e.get_genero_display() if hasattr(e, 'get_genero_display') else e.genero,
                e.telefono_celular or e.telefono_casa or '-',
                'Sí' if e.colocado else 'No',
                'Verificado' if e.es_verificado_padron else 'No Verificado'
            ])

        if fmt == 'excel':
            return exportar_excel('reporte_egresados_uth', 'Egresados Registrados', columnas, filas)
        elif fmt == 'pdf':
            return exportar_pdf('reporte_egresados_uth', 'Reporte de Egresados Registrados', columnas, filas)

        # JSON response por defecto para Angular
        data = [
            {
                'id': e.id,
                'matricula': f[0],
                'nombre': f[1],
                'email': f[2],
                'carrera': f[3],
                'nivel': f[4],
                'genero': f[5],
                'telefono': f[6],
                'colocado': e.colocado,
                'es_verificado_padron': e.es_verificado_padron
            }
            for e, f in zip(qs, filas)
        ]
        return Response(data, status=status.HTTP_200_OK)


class ReporteVacantesView(BaseAdminReportView):
    """Reporte analítico de vacantes con filtros y exportación a Excel y PDF."""
    def get(self, request):
        fmt = request.query_params.get('format', 'json').lower()
        qs = Vacante.objects.select_related('empresa', 'area_estudio').all()

        status_param = request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        area_id = request.query_params.get('area')
        if area_id:
            qs = qs.filter(area_estudio_id=area_id)
        modalidad = request.query_params.get('modalidad')
        if modalidad:
            qs = qs.filter(modalidad=modalidad)
        inclusiva = request.query_params.get('inclusiva')
        if inclusiva is not None:
            qs = qs.filter(es_inclusiva=(inclusiva.lower() in ['true', '1']))

        columnas = ['Clave', 'Puesto / Título', 'Empresa', 'Área de Estudio', 'Modalidad', 'Contratación', 'Sueldo Mín.', 'Sueldo Máx.', 'Estatus']
        filas = []
        for v in qs:
            filas.append([
                v.clave_vacante,
                v.titulo,
                v.empresa.nombre,
                v.area_estudio.nombre,
                v.get_modalidad_display() if hasattr(v, 'get_modalidad_display') else v.modalidad,
                v.get_tipo_contratacion_display() if hasattr(v, 'get_tipo_contratacion_display') else v.tipo_contratacion,
                float(v.sueldo_minimo) if v.sueldo_minimo else 'A tratar',
                float(v.sueldo_maximo) if v.sueldo_maximo else 'A tratar',
                v.get_status_display() if hasattr(v, 'get_status_display') else v.status
            ])

        if fmt == 'excel':
            return exportar_excel('reporte_vacantes_uth', 'Vacantes Institucionales', columnas, filas)
        elif fmt == 'pdf':
            return exportar_pdf('reporte_vacantes_uth', 'Reporte de Vacantes y Empleabilidad', columnas, filas)

        data = [
            {
                'id': v.id,
                'clave': f[0],
                'titulo': f[1],
                'empresa': f[2],
                'area_estudio': f[3],
                'modalidad': f[4],
                'tipo_contratacion': f[5],
                'sueldo_minimo': f[6],
                'sueldo_maximo': f[7],
                'status': v.status
            }
            for v, f in zip(qs, filas)
        ]
        return Response(data, status=status.HTTP_200_OK)


class ReportePostulacionesView(BaseAdminReportView):
    """Reporte de postulaciones con trazabilidad de filtro UTH y decisiones de empresas."""
    def get(self, request):
        fmt = request.query_params.get('format', 'json').lower()
        qs = Postulacion.objects.select_related(
            'vacante', 'vacante__empresa', 'egresado', 'egresado__user', 'egresado__carrera'
        ).all()

        estado_param = request.query_params.get('estado')
        if estado_param:
            qs = qs.filter(estado=estado_param)

        columnas = ['ID', 'Fecha', 'Egresado', 'Matrícula', 'Carrera', 'Vacante', 'Empresa', 'Estado Postulación', 'Notas UTH']
        filas = []
        for p in qs:
            eg = p.egresado
            nombre_eg = f"{eg.user.nombres} {eg.user.apellido_paterno}" if eg and eg.user else '-'
            filas.append([
                p.id,
                p.fecha_postulacion.strftime('%d/%m/%Y'),
                nombre_eg,
                eg.matricula if eg else '-',
                eg.carrera.nombre if eg and eg.carrera else '-',
                p.vacante.titulo if p.vacante else '-',
                p.vacante.empresa.nombre if p.vacante and p.vacante.empresa else '-',
                p.get_estado_display() if hasattr(p, 'get_estado_display') else p.estado,
                p.notas_uth or '-'
            ])

        if fmt == 'excel':
            return exportar_excel('reporte_postulaciones_uth', 'Postulaciones', columnas, filas)
        elif fmt == 'pdf':
            return exportar_pdf('reporte_postulaciones_uth', 'Reporte de Postulaciones y Candidaturas', columnas, filas)

        data = [
            {
                'id': p.id,
                'fecha': f[1],
                'egresado': f[2],
                'matricula': f[3],
                'carrera': f[4],
                'vacante': f[5],
                'empresa': f[6],
                'estado': p.estado,
                'notas_uth': p.notas_uth
            }
            for p, f in zip(qs, filas)
        ]
        return Response(data, status=status.HTTP_200_OK)


class ReporteColocacionesView(BaseAdminReportView):
    """Reporte de efectividad y egresados colocados en el mercado laboral."""
    def get(self, request):
        fmt = request.query_params.get('format', 'json').lower()
        qs = Colocacion.objects.select_related(
            'egresado', 'egresado__user', 'egresado__carrera', 'vacante', 'vacante__empresa', 'evento', 'registrado_por'
        ).all()

        columnas = ['Fecha', 'Matrícula', 'Egresado', 'Carrera', 'Empresa / Destino', 'Vacante Origen', 'Evento Origen', 'Registrado Por']
        filas = []
        for c in qs:
            eg = c.egresado
            nombre_eg = f"{eg.user.nombres} {eg.user.apellido_paterno}" if eg and eg.user else '-'
            empresa_nombre = c.vacante.empresa.nombre if c.vacante and c.vacante.empresa else 'Colocación Externa'
            vacante_titulo = c.vacante.titulo if c.vacante else '-'
            evento_nombre = c.evento.nombre if c.evento else '-'
            filas.append([
                c.fecha_colocacion.strftime('%d/%m/%Y'),
                eg.matricula if eg else '-',
                nombre_eg,
                eg.carrera.nombre if eg and eg.carrera else '-',
                empresa_nombre,
                vacante_titulo,
                evento_nombre,
                c.registrado_por.email if c.registrado_por else '-'
            ])

        if fmt == 'excel':
            return exportar_excel('reporte_colocaciones_uth', 'Colocaciones Laborales', columnas, filas)
        elif fmt == 'pdf':
            return exportar_pdf('reporte_colocaciones_uth', 'Reporte Institucional de Colocación Laboral', columnas, filas)

        data = [
            {
                'id': c.id,
                'fecha_colocacion': f[0],
                'matricula': f[1],
                'egresado': f[2],
                'carrera': f[3],
                'empresa': f[4],
                'vacante': f[5],
                'evento': f[6],
                'observaciones': c.observaciones
            }
            for c, f in zip(qs, filas)
        ]
        return Response(data, status=status.HTTP_200_OK)


class ReporteEmpresasView(BaseAdminReportView):
    """Directorio y reporte de organizaciones registradas en la bolsa de trabajo."""
    def get(self, request):
        fmt = request.query_params.get('format', 'json').lower()
        qs = Empresa.objects.select_related('giro', 'sector').annotate(
            total_vacantes=Count('vacantes')
        ).all()

        columnas = ['Nombre Organización', 'Giro', 'Sector', 'Contacto', 'Cargo', 'Correo', 'Teléfono', 'Vacantes Publicadas', 'Estatus']
        filas = []
        for em in qs:
            filas.append([
                em.nombre,
                em.giro.nombre if em.giro else '-',
                em.sector.nombre if em.sector else '-',
                em.nombre_contacto or '-',
                em.cargo_contacto or '-',
                em.correo_contacto,
                em.telefono_oficina or em.telefono_celular or '-',
                em.total_vacantes,
                em.get_status_display() if hasattr(em, 'get_status_display') else em.status
            ])

        if fmt == 'excel':
            return exportar_excel('directorio_empresas_uth', 'Directorio de Organizaciones', columnas, filas)
        elif fmt == 'pdf':
            return exportar_pdf('directorio_empresas_uth', 'Directorio de Organizaciones y Empleadores', columnas, filas)

        data = [
            {
                'id': em.id,
                'nombre': f[0],
                'giro': f[1],
                'sector': f[2],
                'nombre_contacto': f[3],
                'cargo_contacto': f[4],
                'correo_contacto': f[5],
                'telefono': f[6],
                'total_vacantes': f[7],
                'status': em.status
            }
            for em, f in zip(qs, filas)
        ]
        return Response(data, status=status.HTTP_200_OK)
