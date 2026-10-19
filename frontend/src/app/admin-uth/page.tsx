'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath } from '@/lib/auth';
import {
  ShieldCheck,
  ExternalLink,
  FileCode,
  Users,
  Briefcase,
  Building2,
  Database,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Terminal,
  Calendar,
  BarChart3,
  Clock,
  Send,
  Award,
} from 'lucide-react';
import VacantesAuditor from '@/components/admin/VacantesAuditor';
import PostulacionesFiltro from '@/components/admin/PostulacionesFiltro';
import EmpresasValidador from '@/components/admin/EmpresasValidador';
import PadronManager from '@/components/admin/PadronManager';
import EventosManager from '@/components/admin/EventosManager';
import ReportesDashboard from '@/components/admin/ReportesDashboard';
import {
  fetchAdminVacantes,
  fetchAdminPostulaciones,
  fetchAdminEmpresas,
  fetchPadronEgresados,
  fetchReportsDashboard,
  descargarReporteColocacionExcel,
} from '@/lib/api';
import {
  Container,
  Card,
  StatTile,
  Button,
  SubNav,
  useTabParam,
  StatusPill,
  PageLoader,
  Alert,
} from '@/components/ui';

type AdminTab = 'vacantes' | 'postulaciones' | 'empresas' | 'padron' | 'eventos' | 'reportes';

export default function AdminUthPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth();

  const [tab, setTab] = useTabParam<AdminTab>(
    ['vacantes', 'postulaciones', 'empresas', 'padron', 'eventos', 'reportes'],
    'vacantes'
  );

  // Métricas en vivo
  const [stats, setStats] = useState({
    vacantesPendientes: 0,
    vacantesActivas: 0,
    postulacionesPendientes: 0,
    postulacionesTurnadas: 0,
    empresasActivas: 0,
    colocados: 0,
    padronTotal: 0,
    egresadosPorValidar: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [exportandoExcel, setExportandoExcel] = useState<boolean>(false);
  const [notificacionExport, setNotificacionExport] = useState<{
    tipo: 'success' | 'danger';
    mensaje: string;
  } | null>(null);

  const handleExportarExcel = async () => {
    if (!accessToken) return;
    setExportandoExcel(true);
    setNotificacionExport(null);
    try {
      const res = await descargarReporteColocacionExcel(accessToken);
      if (res.success) {
        setNotificacionExport({
          tipo: 'success',
          mensaje: `Reporte de colocación generado: ${
            res.filename || 'Reporte_Colocacion_Laboral_UTH.xlsx'
          }`,
        });
        setTimeout(() => setNotificacionExport(null), 8000);
      } else {
        setNotificacionExport({
          tipo: 'danger',
          mensaje: res.error || 'No se pudo generar el reporte en Excel.',
        });
      }
    } catch (err: any) {
      setNotificacionExport({
        tipo: 'danger',
        mensaje: err.message || 'Error de conexión al generar el reporte.',
      });
    } finally {
      setExportandoExcel(false);
    }
  };

  const loadStats = async () => {
    if (!accessToken) return;
    setLoadingStats(true);
    try {
      const [dashboard, padr] = await Promise.all([
        fetchReportsDashboard(accessToken).catch(() => null),
        fetchPadronEgresados(accessToken).catch(() => ({ count: 0 })),
      ]);

      if (dashboard) {
        setStats({
          vacantesPendientes: dashboard.vacantes.pendientes,
          vacantesActivas: dashboard.vacantes.aprobadas,
          postulacionesPendientes: dashboard.postulaciones.en_revision_uth,
          postulacionesTurnadas: dashboard.postulaciones.enviadas_empresa,
          empresasActivas: dashboard.empresas.total,
          colocados: dashboard.egresados.colocados,
          padronTotal: padr.count,
          egresadosPorValidar: Math.max(
            0,
            dashboard.egresados.total - dashboard.egresados.verificados_padron
          ),
        });
      } else {
        const [vacs, posts, emps] = await Promise.all([
          fetchAdminVacantes(accessToken, 'todas').catch(() => []),
          fetchAdminPostulaciones(accessToken, 'todas').catch(() => []),
          fetchAdminEmpresas(accessToken, 'todas').catch(() => []),
        ]);
        setStats({
          vacantesPendientes: vacs.filter((v) => v.status === 'pendiente').length,
          vacantesActivas: vacs.filter((v) => v.status === 'aprobada').length,
          postulacionesPendientes: posts.filter((p) => p.estado === 'revision_uth').length,
          postulacionesTurnadas: posts.filter((p) => p.estado === 'enviada_empresa').length,
          empresasActivas: emps.filter((e) => e.status === 'aprobada').length,
          colocados: posts.filter((p) => p.estado === 'Aceptada').length,
          padronTotal: padr.count,
          egresadosPorValidar: 0,
        });
      }
    } catch (err) {
      console.error('Error cargando métricas UTH:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin-uth');
      } else if (user && user.rol !== 'admin_uth' && user.rol !== 'soporte_ti') {
        router.replace(getRoleRedirectPath(user.rol));
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (accessToken && user && (user.rol === 'admin_uth' || user.rol === 'soporte_ti')) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user]);

  if (isLoading) {
    return <PageLoader label="Iniciando consola institucional UTH…" />;
  }

  if (!user || !accessToken || (user.rol !== 'admin_uth' && user.rol !== 'soporte_ti')) {
    return null;
  }

  const tabItems = [
    {
      id: 'vacantes' as const,
      label: 'Auditoría de Vacantes',
      icon: Briefcase,
      count: stats.vacantesPendientes,
    },
    {
      id: 'postulaciones' as const,
      label: 'Filtro de Candidatos',
      icon: Send,
      count: stats.postulacionesPendientes,
    },
    {
      id: 'empresas' as const,
      label: 'Directorio Empresas',
      icon: Building2,
    },
    {
      id: 'padron' as const,
      label: 'Padrón y Validación',
      icon: FileSpreadsheet,
      count: stats.egresadosPorValidar,
    },
    {
      id: 'eventos' as const,
      label: 'Eventos y Ferias',
      icon: Calendar,
    },
    {
      id: 'reportes' as const,
      label: 'Indicadores CACEI / ISO',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-[85vh] bg-canvas flex flex-col">
      {/* Sub-Navegación Esmerilada Fija (Apple Sub-nav) */}
      <SubNav
        title={user.rol === 'soporte_ti' ? 'Consola TI' : 'Consola Vinculación'}
        items={tabItems}
        value={tab}
        onChange={setTab}
        action={
          <Button
            variant="utility"
            size="sm"
            loading={exportandoExcel}
            icon={<Download className="size-4" />}
            onClick={handleExportarExcel}
          >
            <span className="hidden sm:inline">Exportar CACEI</span>
            <span className="hidden xl:inline"> (.xlsx)</span>
            <span className="sm:hidden">Excel</span>
          </Button>
        }
      />

      <main className="py-8 sm:py-10 flex-1">
        <Container size="console" className="space-y-8">
          {/* Banner Institucional Sobrio */}
          <Card tone="parchment" padded className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="brand">
                    {user.rol === 'soporte_ti'
                      ? 'Soporte TI & Infraestructura'
                      : 'Dirección de Vinculación y Extensión'}
                  </StatusPill>
                  <span className="text-caption text-ink-64">
                    {user.email}
                  </span>
                </div>

                <h1 className="text-display-md text-ink font-semibold">
                  {user.rol === 'soporte_ti' ? 'Consola de Sistemas' : 'Consola Institucional'} ·{' '}
                  {user.nombres} {user.apellido_paterno}
                </h1>

                <p className="text-caption text-ink-64 max-w-2xl leading-relaxed">
                  {user.rol === 'soporte_ti'
                    ? 'Supervisión técnica de la plataforma, auditoría de ofertas, base de datos y catálogos normativos.'
                    : 'Auditoría de convocatorias laborales, filtro de pertinencia de candidatos egresados y convenios empresariales.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="pearl"
                  size="sm"
                  icon={<RefreshCw className={`size-3.5 ${loadingStats ? 'animate-spin' : ''}`} />}
                  onClick={loadStats}
                >
                  Actualizar Métricas
                </Button>

                {user.rol === 'soporte_ti' && (
                  <>
                    <a
                      href="http://localhost:8080/admin/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press inline-flex items-center gap-1.5 h-9 px-3.5 rounded-field text-caption font-semibold bg-canvas ring-1 ring-hairline text-ink hover:bg-pearl"
                      title="Abrir Django Admin"
                    >
                      <Database className="size-3.5 text-primary" />
                      <span>Django Admin</span>
                      <ExternalLink className="size-3 text-ink-48" />
                    </a>

                    <a
                      href="http://localhost:8080/api/v1/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press inline-flex items-center gap-1.5 h-9 px-3.5 rounded-field text-caption font-semibold bg-canvas ring-1 ring-hairline text-ink hover:bg-pearl"
                      title="Abrir Swagger OpenAPI"
                    >
                      <FileCode className="size-3.5 text-primary" />
                      <span>API Docs</span>
                      <ExternalLink className="size-3 text-ink-48" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Alerta de notificación si aplica */}
          {notificacionExport && (
            <Alert
              tone={notificacionExport.tipo}
              title={notificacionExport.tipo === 'success' ? 'Reporte generado' : 'Aviso de exportación'}
            >
              {notificacionExport.mensaje}
            </Alert>
          )}

          {/* Tarjetas de Métricas en Vivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setTab('vacantes')}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <StatTile
                label="Vacantes por Auditar"
                value={loadingStats ? '…' : stats.vacantesPendientes}
                hint={`${stats.vacantesActivas} vacantes activas en bolsa`}
                tone={tab === 'vacantes' ? 'parchment' : 'canvas'}
              />
            </div>

            <div
              onClick={() => setTab('postulaciones')}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <StatTile
                label="Candidatos por Turnar"
                value={loadingStats ? '…' : stats.postulacionesPendientes}
                hint={`${stats.postulacionesTurnadas} enviados a empresas`}
                tone={tab === 'postulaciones' ? 'parchment' : 'canvas'}
              />
            </div>

            <div
              onClick={() => setTab('empresas')}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <StatTile
                label="Empresas en Convenio"
                value={loadingStats ? '…' : stats.empresasActivas}
                hint="Organizaciones activas en la región"
                tone={tab === 'empresas' ? 'parchment' : 'canvas'}
              />
            </div>

            <div
              onClick={() => setTab('reportes')}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <StatTile
                label="Colocaciones UTH"
                value={loadingStats ? '…' : stats.colocados}
                hint="Egresados contratados (CACEI)"
                tone={tab === 'reportes' ? 'parchment' : 'canvas'}
              />
            </div>
          </div>

          {/* Contenido Dinámico de la Pestaña Activa */}
          <div className="animate-fade-in">
            {tab === 'vacantes' && (
              <VacantesAuditor token={accessToken} onStatsChange={loadStats} />
            )}

            {tab === 'postulaciones' && (
              <PostulacionesFiltro token={accessToken} onStatsChange={loadStats} />
            )}

            {tab === 'empresas' && (
              <EmpresasValidador token={accessToken} onStatsChange={loadStats} />
            )}

            {tab === 'padron' && (
              <PadronManager token={accessToken} onStatsChange={loadStats} />
            )}

            {tab === 'eventos' && (
              <EventosManager token={accessToken} />
            )}

            {tab === 'reportes' && (
              <ReportesDashboard token={accessToken} />
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
