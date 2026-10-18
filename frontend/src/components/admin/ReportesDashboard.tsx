'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  RefreshCw, 
  ShieldCheck, 
  Award,
  PieChart,
  Percent
} from 'lucide-react';
import { 
  DashboardStats, 
  fetchReportsDashboard, 
  descargarReporteInstitucional 
} from '@/lib/api';

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
        message: `Reporte institucional descargado con éxito: ${res.filename}`
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || `Error al exportar reporte de ${tipo} en ${formato.toUpperCase()}.`
      });
    }
  };

  const getNivelDisplay = (nivel: string) => {
    switch (nivel) {
      case 'TSU': return 'Técnico Superior Universitario (TSU)';
      case 'ING_LIC': return 'Ingeniería / Licenciatura';
      case 'MTRIA': return 'Maestría / Posgrado';
      default: return nivel;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 bg-white rounded-2xl border border-zinc-200">
        <Loader2 className="w-9 h-9 text-[#691C32] animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#636569]">
          Calculando métricas e indicadores de empleabilidad institucional...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-zinc-200 p-8">
        <p className="text-sm font-bold text-[#2D2926]">No se pudieron cargar las métricas institucionales.</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado CACEI / ISO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#691C32]/10 text-[#691C32] border border-[#691C32]/20">
              Acreditación CACEI / CONAIC / ISO 9001:2015
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-xs text-[#636569] font-medium">Desempeño de Egresados UTH</span>
          </div>
          <h2 className="text-xl font-black text-[#2D2926]">
            Tablero de Inteligencia & Indicadores de Empleabilidad
          </h2>
          <p className="text-xs text-[#636569]">
            Métricas en tiempo real sobre pertinencia de egresados, inserción al mercado laboral y trazabilidad de vacantes.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Métricas
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button 
            onClick={() => setFeedback(null)} 
            className="font-bold underline ml-3 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KPIs Principales - Fila Superior */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tasa de Colocación (KPI Estrella CACEI) */}
        <div className="bg-gradient-to-br from-[#00A887] to-[#008F73] text-white p-6 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Tasa de Inserción Laboral
            </span>
            <Award className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl sm:text-4xl font-black">
            {stats.egresados.tasa_colocacion_porcentaje}%
          </div>
          <p className="text-xs text-emerald-100">
            {stats.egresados.colocados} de {stats.egresados.total} egresados colocados en su perfil profesional.
          </p>
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.egresados.tasa_colocacion_porcentaje, 100)}%` }}
            />
          </div>
        </div>

        {/* Egresados en Padrón */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Egresados Registrados</span>
            <GraduationCap className="w-5 h-5 text-[#691C32]" />
          </div>
          <div className="text-3xl font-black text-[#2D2926]">
            {stats.egresados.total}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{stats.egresados.verificados_padron} validados en padrón oficial</span>
          </div>
        </div>

        {/* Empresas Vinculadas */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas en Bolsa</span>
            <Building2 className="w-5 h-5 text-[#00A887]" />
          </div>
          <div className="text-3xl font-black text-[#2D2926]">
            {stats.empresas.total}
          </div>
          <div className="text-xs text-[#636569] font-medium">
            <strong className="text-[#2D2926]">{stats.empresas.con_vacantes_activas}</strong> con ofertas vigentes
          </div>
        </div>

        {/* Vacantes Totales */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Vacantes Aprobadas</span>
            <Briefcase className="w-5 h-5 text-[#C2BA98]" />
          </div>
          <div className="text-3xl font-black text-[#2D2926]">
            {stats.vacantes.aprobadas}
          </div>
          <div className="flex items-center justify-between text-xs text-[#636569]">
            <span>{stats.vacantes.pendientes} pendientes de revisión</span>
            <span className="font-bold text-[#00A887]">{stats.vacantes.inclusivas} inclusivas</span>
          </div>
        </div>
      </div>

      {/* Embudo de Postulaciones y Filtro UTH */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#2D2926]">
              Trazabilidad del Filtro Institucional UTH (Embudo Opción B)
            </h3>
            <p className="text-xs text-[#636569]">
              Garantía de calidad: Ninguna postulación llega a la empresa sin pertinencia académica validada.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-zinc-100 text-zinc-700">
            {stats.postulaciones.total} postulaciones totales
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">1. En Filtro UTH</span>
            <div className="text-2xl font-black text-amber-900">{stats.postulaciones.en_revision_uth}</div>
            <p className="text-[11px] text-amber-700 font-medium">Por turnar</p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">2. Turnadas</span>
            <div className="text-2xl font-black text-blue-900">{stats.postulaciones.enviadas_empresa}</div>
            <p className="text-[11px] text-blue-700 font-medium">Con el empleador</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">3. Colocados</span>
            <div className="text-2xl font-black text-emerald-900">{stats.postulaciones.aceptadas}</div>
            <p className="text-[11px] text-emerald-700 font-medium">Contratados</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">Descarte UTH</span>
            <div className="text-2xl font-black text-rose-900">{stats.postulaciones.rechazadas_uth}</div>
            <p className="text-[11px] text-rose-700 font-medium">Sin afinidad</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 space-y-1">
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">Descarte Empresa</span>
            <div className="text-2xl font-black text-zinc-800">{stats.postulaciones.rechazadas_empresa}</div>
            <p className="text-[11px] text-zinc-600 font-medium">Proceso cerrado</p>
          </div>
        </div>
      </div>

      {/* Desglose por Carrera y por Nivel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colocaciones por Carrera */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-[#2D2926]">
              Colocaciones por Programa Educativo (Top Carreras)
            </h3>
            <span className="text-[11px] text-[#636569] font-medium">Criterio CACEI</span>
          </div>

          {stats.colocaciones_destacadas.por_carrera.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">No hay registros de colocación por carrera aún.</p>
          ) : (
            <div className="space-y-3">
              {stats.colocaciones_destacadas.por_carrera.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2D2926] truncate max-w-xs">
                      {c.egresado__carrera__nombre || 'Carrera sin especificar'}
                    </span>
                    <span className="font-mono font-bold text-[#00A887]">
                      {c.total} colocados
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#00A887] h-full rounded-full" 
                      style={{ 
                        width: `${Math.min((c.total / (stats.egresados.colocados || 1)) * 100, 100)}%` 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colocaciones por Nivel de Estudios */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-[#2D2926]">
              Inserción por Grado Académico
            </h3>
            <span className="text-[11px] text-[#636569] font-medium">TSU vs Ingeniería</span>
          </div>

          {stats.colocaciones_destacadas.por_nivel.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">No hay registros de colocación por nivel aún.</p>
          ) : (
            <div className="space-y-4">
              {stats.colocaciones_destacadas.por_nivel.map((n, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#2D2926]">
                      {getNivelDisplay(n.egresado__nivel_estudios)}
                    </span>
                    <p className="text-[11px] text-[#636569]">Egresados titulados colocados</p>
                  </div>
                  <span className="text-xl font-black text-[#691C32] font-mono">
                    {n.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Centro de Descargas de Auditoría Oficial */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-base font-bold text-[#2D2926]">
            Exportación de Expedientes para Auditoría (Excel / PDF)
          </h3>
          <p className="text-xs text-[#636569]">
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
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#2D2926]">{rep.title}</h4>
                <p className="text-[11px] text-[#636569] leading-relaxed">{rep.desc}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                <button
                  onClick={() => handleDownloadReport(rep.id, 'excel')}
                  disabled={downloading !== null}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                  title="Descargar en formato Excel (.xlsx)"
                >
                  {downloading === `${rep.id}-excel` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  Excel (.xlsx)
                </button>

                <button
                  onClick={() => handleDownloadReport(rep.id, 'pdf')}
                  disabled={downloading !== null}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                  title="Descargar en formato PDF (.pdf)"
                >
                  {downloading === `${rep.id}-pdf` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  PDF (.pdf)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
