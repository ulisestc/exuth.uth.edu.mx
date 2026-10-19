'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  DashboardStats,
  fetchReportsDashboard,
  descargarReporteInstitucional,
} from '@/lib/api';
import {
  Card,
  Button,
  Alert,
  StatTile,
  Tag,
  Code,
} from '@/components/ui';

interface ReportesDashboardProps {
  token: string;
}

export default function ReportesDashboard({ token }: ReportesDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchReportsDashboard(token);
      setStats(data);
    } catch (err) {
      console.error('Error cargando métricas de reporte:', err);
      setFeedback({ type: 'error', message: 'No se pudieron sincronizar los indicadores institucionales.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDownloadReport = async (
    tipo: 'egresados' | 'vacantes' | 'postulaciones' | 'colocaciones' | 'empresas',
    formato: 'excel' | 'pdf'
  ) => {
    const key = `${tipo}-${formato}`;
    setDownloading(key);
    setFeedback(null);

    const res = await descargarReporteInstitucional(token, tipo, formato);
    setDownloading(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Reporte institucional descargado con éxito: ${res.filename}`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || `Error al exportar reporte de ${tipo} en ${formato.toUpperCase()}.`,
      });
    }
  };

  const getNivelDisplay = (nivel: string) => {
    switch (nivel) {
      case 'TSU':
        return 'Técnico Superior Universitario (TSU)';
      case 'ING_LIC':
        return 'Ingeniería / Licenciatura';
      case 'MTRIA':
        return 'Maestría / Posgrado';
      default:
        return nivel;
    }
  };

  if (loading) {
    return (
      <Card padding="lg" className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-caption font-medium text-ink-muted">
          Calculando métricas e indicadores de empleabilidad institucional...
        </p>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card padding="lg" className="py-16 text-center space-y-4">
        <p className="text-body-sm font-semibold text-ink">
          No se pudieron cargar las métricas institucionales.
        </p>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={loadDashboard}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reintentar Carga
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado CACEI / ISO */}
      <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="wine">Acreditación CACEI / CONAIC / ISO 9001:2015</Tag>
            <span className="text-caption text-ink-muted">· Desempeño de Egresados UTH</span>
          </div>
          <h2 className="text-card-title text-ink">
            Tablero de Inteligencia e Indicadores de Empleabilidad
          </h2>
          <p className="text-caption text-ink-muted">
            Métricas en tiempo real sobre pertinencia de egresados, inserción al mercado laboral y trazabilidad de vacantes.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadDashboard}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          className="shrink-0"
        >
          Sincronizar Métricas
        </Button>
      </Card>

      {/* Alerta de Feedback */}
      {feedback && (
        <Alert
          tone={feedback.type === 'success' ? 'success' : 'danger'}
          onDismiss={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* KPIs Principales - Fila Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          tone="dark"
          label="Tasa de Inserción Laboral"
          value={`${stats.egresados.tasa_colocacion_porcentaje}%`}
          helper={`${stats.egresados.colocados} de ${stats.egresados.total} egresados colocados`}
          icon={<Award className="w-4 h-4" />}
        />

        <StatTile
          tone="canvas"
          label="Egresados Registrados"
          value={stats.egresados.total}
          helper={`${stats.egresados.verificados_padron} validados en padrón oficial`}
          icon={<GraduationCap className="w-4 h-4" />}
        />

        <StatTile
          tone="canvas"
          label="Empresas en Bolsa"
          value={stats.empresas.total}
          helper={`${stats.empresas.con_vacantes_activas} con ofertas vigentes`}
          icon={<Building2 className="w-4 h-4" />}
        />

        <StatTile
          tone="canvas"
          label="Vacantes Aprobadas"
          value={stats.vacantes.aprobadas}
          helper={`${stats.vacantes.pendientes} pendientes · ${stats.vacantes.inclusivas} inclusivas`}
          icon={<Briefcase className="w-4 h-4" />}
        />
      </div>

      {/* Embudo de Postulaciones y Filtro UTH */}
      <Card padding="md" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider pb-4">
          <div className="space-y-0.5">
            <h3 className="text-body font-semibold text-ink">
              Trazabilidad del Filtro Institucional UTH (Embudo Opción B)
            </h3>
            <p className="text-caption text-ink-muted">
              Garantía de calidad: Ninguna postulación llega a la empresa sin pertinencia académica validada.
            </p>
          </div>
          <Code>{stats.postulaciones.total} postulaciones totales</Code>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-warn-bg border border-warn-border space-y-1">
            <span className="text-micro font-semibold text-warn uppercase tracking-wider block">
              1. En Filtro UTH
            </span>
            <div className="text-subhead font-semibold text-ink tabular-nums">
              {stats.postulaciones.en_revision_uth}
            </div>
            <p className="text-caption text-ink-muted">Por turnar</p>
          </div>

          <div className="p-4 rounded-xl bg-info-bg border border-info-border space-y-1">
            <span className="text-micro font-semibold text-info uppercase tracking-wider block">
              2. Turnadas
            </span>
            <div className="text-subhead font-semibold text-ink tabular-nums">
              {stats.postulaciones.enviadas_empresa}
            </div>
            <p className="text-caption text-ink-muted">Con el empleador</p>
          </div>

          <div className="p-4 rounded-xl bg-success-bg border border-success-border space-y-1">
            <span className="text-micro font-semibold text-success uppercase tracking-wider block">
              3. Colocados
            </span>
            <div className="text-subhead font-semibold text-ink tabular-nums">
              {stats.postulaciones.aceptadas}
            </div>
            <p className="text-caption text-ink-muted">Contratados</p>
          </div>

          <div className="p-4 rounded-xl bg-danger-bg border border-danger-border space-y-1">
            <span className="text-micro font-semibold text-danger uppercase tracking-wider block">
              Descarte UTH
            </span>
            <div className="text-subhead font-semibold text-ink tabular-nums">
              {stats.postulaciones.rechazadas_uth}
            </div>
            <p className="text-caption text-ink-muted">Sin afinidad</p>
          </div>

          <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-1">
            <span className="text-micro font-semibold text-ink-muted uppercase tracking-wider block">
              Descarte Empresa
            </span>
            <div className="text-subhead font-semibold text-ink tabular-nums">
              {stats.postulaciones.rechazadas_empresa}
            </div>
            <p className="text-caption text-ink-muted">Proceso cerrado</p>
          </div>
        </div>
      </Card>

      {/* Desglose por Carrera y por Nivel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colocaciones por Carrera */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h3 className="text-body-sm font-semibold text-ink">
              Colocaciones por Programa Educativo (Top Carreras)
            </h3>
            <Tag tone="neutral">Criterio CACEI</Tag>
          </div>

          {stats.colocaciones_destacadas.por_carrera.length === 0 ? (
            <p className="text-caption text-ink-muted py-8 text-center">
              No hay registros de colocación por carrera aún.
            </p>
          ) : (
            <div className="space-y-3.5">
              {stats.colocaciones_destacadas.por_carrera.map((c, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-caption">
                    <span className="font-medium text-ink truncate">
                      {c.egresado__carrera__nombre || 'Carrera sin especificar'}
                    </span>
                    <span className="font-mono font-semibold text-primary shrink-0">
                      {c.total} colocados
                    </span>
                  </div>
                  <div className="w-full bg-parchment rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((c.total / (stats.egresados.colocados || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Colocaciones por Nivel de Estudios */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h3 className="text-body-sm font-semibold text-ink">
              Inserción por Grado Académico
            </h3>
            <Tag tone="neutral">TSU vs Ingeniería</Tag>
          </div>

          {stats.colocaciones_destacadas.por_nivel.length === 0 ? (
            <p className="text-caption text-ink-muted py-8 text-center">
              No hay registros de colocación por nivel aún.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.colocaciones_destacadas.por_nivel.map((n, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-parchment border border-hairline flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-body-sm font-semibold text-ink block">
                      {getNivelDisplay(n.egresado__nivel_estudios)}
                    </span>
                    <p className="text-caption text-ink-muted">Egresados titulados colocados</p>
                  </div>
                  <span className="text-subhead font-semibold text-wine font-mono tabular-nums">
                    {n.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Centro de Descargas de Auditoría Oficial */}
      <Card padding="md" className="space-y-5">
        <div className="border-b border-divider pb-3 space-y-1">
          <h3 className="text-body font-semibold text-ink">
            Exportación de Expedientes para Auditoría (Excel / PDF)
          </h3>
          <p className="text-caption text-ink-muted">
            Genera al instante los archivos normalizados requeridos por los comités evaluadores de CACEI, CONAIC y la Dirección General de Universidades Tecnológicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'colocaciones' as const,
              title: 'Reporte de Colocación Laboral',
              desc: 'Trazabilidad de egresados contratados por empresa y carrera.',
            },
            {
              id: 'egresados' as const,
              title: 'Padrón General de Egresados',
              desc: 'Relación con estatus de padrón, carrera y nivel.',
            },
            {
              id: 'vacantes' as const,
              title: 'Catálogo de Ofertas Laborales',
              desc: 'Vacantes publicadas, sueldos, modalidad y empresa.',
            },
            {
              id: 'postulaciones' as const,
              title: 'Seguimiento de Postulaciones',
              desc: 'Histórico de dictámenes UTH y resoluciones.',
            },
            {
              id: 'empresas' as const,
              title: 'Directorio de Organizaciones',
              desc: 'Empresas vinculadas, giros, sectores y contactos.',
            },
          ].map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl border border-hairline bg-parchment/50 hover:bg-canvas transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1">
                <h4 className="text-body-sm font-semibold text-ink">{rep.title}</h4>
                <p className="text-caption text-ink-muted leading-relaxed">{rep.desc}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-divider">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadReport(rep.id, 'excel')}
                  disabled={downloading !== null}
                  loading={downloading === `${rep.id}-excel`}
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-primary" />}
                  className="flex-1"
                >
                  Excel (.xlsx)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadReport(rep.id, 'pdf')}
                  disabled={downloading !== null}
                  loading={downloading === `${rep.id}-pdf`}
                  leftIcon={<FileText className="w-3.5 h-3.5 text-wine" />}
                  className="flex-1"
                >
                  PDF (.pdf)
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
