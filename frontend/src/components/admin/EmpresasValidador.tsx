'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  User, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { EmpresaListItem, fetchAdminEmpresas, cambiarStatusEmpresa } from '@/lib/api';

interface EmpresasValidadorProps {
  token: string;
  onStatsChange?: () => void;
}

export default function EmpresasValidador({ token, onStatsChange }: EmpresasValidadorProps) {
  const [empresas, setEmpresas] = useState<EmpresaListItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pendiente');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadEmpresas = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchAdminEmpresas(token, filterStatus);
      setEmpresas(data);
    } catch (err) {
      console.error('Error cargando empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, [filterStatus]);

  const handleStatusChange = async (empresaId: number, nuevoStatus: 'aprobada' | 'rechazada') => {
    const confirmMsg = nuevoStatus === 'aprobada'
      ? '¿Confirmas la APROBACIÓN de esta empresa en convenio? Podrá publicar ofertas y recibir candidatos.'
      : '¿Deseas RECHAZAR o suspender a esta empresa?';

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(empresaId);
    setFeedback(null);

    const res = await cambiarStatusEmpresa(token, empresaId, nuevoStatus);
    setProcessingId(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `La empresa fue ${nuevoStatus === 'aprobada' ? 'APROBADA en convenio con éxito' : 'RECHAZADA'}.`
      });
      loadEmpresas();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Ocurrió un error al actualizar el estatus de la empresa.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#636569] uppercase tracking-wider mr-2">Estatus:</span>
          {[
            { id: 'pendiente', label: 'Pendientes de Validación' },
            { id: 'aprobada', label: 'Aprobadas en Convenio' },
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
          onClick={loadEmpresas}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#636569] hover:text-[#2D2926] hover:bg-zinc-100 transition-all cursor-pointer self-start sm:self-auto"
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

      {/* Listado de Empresas */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-[#00A887] animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Consultando padrón de organizaciones vinculadas...</p>
        </div>
      ) : empresas.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200 p-8">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2D2926]">No hay empresas en este criterio</h3>
          <p className="text-xs text-[#636569] max-w-sm mx-auto">
            {filterStatus === 'pendiente'
              ? 'Excelente: No hay empresas pendientes de validación en este momento.'
              : 'No se encontraron empresas registradas en este estatus.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {empresas.map((e) => {
            const isProcessing = processingId === e.id;

            return (
              <div 
                key={e.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {e.status === 'pendiente' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pendiente Validación
                          </span>
                        )}
                        {e.status === 'aprobada' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Convenio Aprobado
                          </span>
                        )}
                        {e.status === 'rechazada' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Rechazada
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#2D2926] mt-1.5">
                        {e.nombre}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#636569]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#00A887]" />
                      <span className="font-medium text-[#2D2926]">{e.nombre_contacto}</span>
                      <span>· {e.cargo_contacto}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#691C32]" />
                      <a href={`mailto:${e.correo_contacto}`} className="hover:underline">{e.correo_contacto}</a>
                    </div>

                    {(e.telefono_oficina || e.telefono_celular) && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C2BA98]" />
                        <span>{e.telefono_oficina || e.telefono_celular}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{e.domicilio}</span>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-[#2D2926]">
                        Giro: {e.giro}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-[#2D2926]">
                        Sector: {e.sector}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  {e.status !== 'aprobada' && (
                    <button
                      onClick={() => handleStatusChange(e.id, 'aprobada')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Aprobar Convenio
                    </button>
                  )}

                  {e.status !== 'rechazada' && (
                    <button
                      onClick={() => handleStatusChange(e.id, 'rechazada')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#691C32] hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Rechazar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
