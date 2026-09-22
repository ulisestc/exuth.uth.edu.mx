from django.urls import path
from .views import (
    DashboardStatsView,
    ReporteEgresadosView,
    ReporteVacantesView,
    ReportePostulacionesView,
    ReporteColocacionesView,
    ReporteEmpresasView,
)

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='report-dashboard'),
    path('egresados/', ReporteEgresadosView.as_view(), name='report-egresados'),
    path('vacantes/', ReporteVacantesView.as_view(), name='report-vacantes'),
    path('postulaciones/', ReportePostulacionesView.as_view(), name='report-postulaciones'),
    path('colocaciones/', ReporteColocacionesView.as_view(), name='report-colocaciones'),
    path('empresas/', ReporteEmpresasView.as_view(), name='report-empresas'),
]
