'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Vacante, fetchAdminVacantes, cambiarStatusVacante } from '@/lib/api';

interface VacantesAuditorProps {
  token: string;
  onStatsChange?: () => void;
}

export default function VacantesAuditor({ token, onStatsChange }: VacantesAuditorProps) {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pendiente');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadVacantes = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchAdminVacantes(token, filterStatus);
      setVacantes(data);
    } catch (err) {
      console.error('Error cargando vacantes para auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacantes();
  }, [filterStatus]);

  const handleStatusChange = async (vacanteId: number, nuevoStatus: 'aprobada' | 'rechazada') => {
    const confirmMsg = nuevoStatus === 'aprobada' 
      ? '¿Confirmas la APROBACIÓN de esta vacante? Se publicará inmediatamente en la bolsa de trabajo para todos los egresados.'
      : '¿Deseas RECHAZAR esta vacante? No será visible para los egresados.';

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(vacanteId);
    setFeedback(null);

    const res = await cambiarStatusVacante(token, vacanteId, nuevoStatus);
    setProcessingId(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `La vacante #${vacanteId} fue ${nuevoStatus === 'aprobada' ? 'APROBADA y publicada con éxito' : 'RECHAZADA'}.`
      });
      loadVacantes();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Ocurrió un error al actualizar la vacante.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Recarga */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#636569] uppercase tracking-wider mr-2">Estatus:</span>
          {[
            { id: 'pendiente', label: 'Pendientes por Revisar', countBadge: true },
            { id: 'aprobada', label: 'Aprobadas (Activas)' },
            { id: 'rechazada', label: 'Rechazadas' },
            { id: 'todas', label: 'Todas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#00A887] text-white shadow-sm'
                  : 'bg-zinc-100 text-[#2D2926] hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadVacantes}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#636569] hover:text-[#2D2926] hover:bg-zinc-100 transition-all cursor-pointer self-start sm:self-auto"
          title="Actualizar lista"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      {/* Alerta de feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button 
            onClick={() => setFeedback(null)}
            className="text-xs font-bold ml-4 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Listado de Vacantes */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-[#00A887] animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando vacantes desde la base de datos institucional...</p>
        </div>
      ) : vacantes.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200 p-8">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2D2926]">No hay ofertas en este criterio</h3>
          <p className="text-xs text-[#636569] max-w-sm mx-auto">
            {filterStatus === 'pendiente' 
              ? 'Excelente: No hay vacantes pendientes de revisión en este momento. Todas las solicitudes han sido auditadas.' 
              : 'No se encontraron vacantes registradas para el filtro seleccionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vacantes.map((v) => {
            const isExpanded = expandedId === v.id;
            const isProcessing = processingId === v.id;

            return (
              <div 
                key={v.id} 
                className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden transition-all hover:border-zinc-300"
              >
                {/* Header de la tarjeta */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-[#2D2926] border border-zinc-200">
                        {v.clave_vacante || `UTH-VAC-${v.id}`}
                      </span>

                      {v.status === 'pendiente' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pendiente de Auditoría UTH
                        </span>
                      )}
                      {v.status === 'aprobada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprobada · Pública
                        </span>
                      )}
                      {v.status === 'rechazada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Rechazada por UTH
                        </span>
                      )}
                      {v.status === 'cerrada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          Cerrada por Empresa
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#2D2926]">
                      {v.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2D2926]">
                        <Building2 className="w-3.5 h-3.5 text-[#00A887]" />
                        {v.empresa_nombre || `Empresa ID: ${v.empresa}`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C2BA98]" />
                        {v.modalidad === 'presencial' ? 'Presencial' : v.modalidad === 'home_office' ? 'Home Office' : 'Híbrido'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {v.salario_a_tratar 
                          ? 'A tratar' 
                          : v.sueldo_minimo && v.sueldo_maximo 
                            ? `$${Number(v.sueldo_minimo).toLocaleString('es-MX')} - $${Number(v.sueldo_maximo).toLocaleString('es-MX')} MXN`
                            : 'No especificado'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(v.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#636569] bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Menos datos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          Detalles
                        </>
                      )}
                    </button>

                    {v.status !== 'aprobada' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'aprobada')}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title="Aprobar y publicar en la bolsa pública"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Aprobar
                      </button>
                    )}

                    {v.status !== 'rechazada' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'rechazada')}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#691C32] hover:bg-[#521627] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title="Rechazar vacante"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Rechazar
                      </button>
                    )}
                  </div>
                </div>

                {/* Sección Desplegable de Detalles */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-zinc-100 bg-zinc-50/50 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-zinc-200">
                        <h4 className="font-bold text-[#2D2926] uppercase tracking-wider text-[11px] text-[#691C32]">
                          Perfil Solicitado y Requisitos
                        </h4>
                        <p><strong className="text-[#2D2926]">Nivel de Estudios:</strong> {v.nivel_estudios}</p>
                        <p><strong className="text-[#2D2926]">Tipo Contrato:</strong> {v.tipo_contratacion}</p>
                        <p><strong className="text-[#2D2926]">Horario:</strong> {v.horario_trabajo || 'No especificado'}</p>
                        <p><strong className="text-[#2D2926]">Experiencia:</strong> {v.experiencia}</p>
                        <p><strong className="text-[#2D2926]">Conocimientos:</strong> {v.conocimientos}</p>
                        <p><strong className="text-[#2D2926]">Habilidades:</strong> {v.habilidades}</p>
                      </div>

                      <div className="space-y-2 bg-white p-4 rounded-lg border border-zinc-200">
                        <h4 className="font-bold text-[#2D2926] uppercase tracking-wider text-[11px] text-[#00A887]">
                          Condiciones y Contacto
                        </h4>
                        <p><strong className="text-[#2D2926]">Responsabilidades:</strong> {v.responsabilidades}</p>
                        <p><strong className="text-[#2D2926]">Prestaciones:</strong> {v.prestaciones || 'De ley'}</p>
                        <p><strong className="text-[#2D2926]">Persona de Contacto:</strong> {v.persona_contacto}</p>
                        <p><strong className="text-[#2D2926]">Entrevistador:</strong> {v.entrevistador || 'Por definir'}</p>
                        <p><strong className="text-[#2D2926]">Transporte / Comedor:</strong> {v.incluye_transporte ? 'Sí Transporte' : 'No Transporte'} | {v.incluye_comedor ? 'Sí Comedor' : 'No Comedor'}</p>
                        {v.observaciones && <p><strong className="text-[#2D2926]">Notas Adicionales:</strong> {v.observaciones}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
