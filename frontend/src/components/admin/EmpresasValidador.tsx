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
  const [filterStatus, setFilterStatus] = useState<string>('todas');
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
      ? '¿Confirmas la REACTIVACIÓN del convenio para esta organización? Podrá publicar ofertas y recibir candidatos.'
      : '¿Confirmas la SUSPENSIÓN temporal del convenio para esta empresa? Su acceso y vacantes quedarán pausadas.';

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(empresaId);
    setFeedback(null);

    const res = await cambiarStatusEmpresa(token, empresaId, nuevoStatus);
    setProcessingId(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `El estatus de la empresa fue actualizado exitosamente a: ${nuevoStatus === 'aprobada' ? 'Activa en Convenio' : 'Suspendida'}.`
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
      {/* Banner Informativo Normativo UTH */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs text-[#2D2926]">
        <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#00A887]">Convenio y Autonomía de Registro:</span>
          <p className="text-zinc-600 leading-relaxed">
            Las organizaciones registradas cuentan con alta automática en convenio para publicar ofertas laborales de inmediato.
            La Dirección de Vinculación y Soporte TI auditan periódicamente la información institucional y pueden suspender temporalmente el acceso de organizaciones en caso de requerirse.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#636569] uppercase tracking-wider mr-2">Estatus:</span>
          {[
            { id: 'todas', label: 'Todas las Organizaciones' },
            { id: 'aprobada', label: 'Activas en Convenio' },
            { id: 'rechazada', label: 'Suspendidas' },
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
            {filterStatus === 'rechazada'
              ? 'No hay empresas suspendidas en el sistema.'
              : 'No se encontraron organizaciones registradas en este estatus.'}
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
                        {e.status === 'aprobada' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Convenio Activo
                          </span>
                        )}
                        {e.status === 'rechazada' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Convenio Suspendido
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
                  {e.status === 'aprobada' ? (
                    <button
                      onClick={() => handleStatusChange(e.id, 'rechazada')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                      title="Suspender temporalmente acceso de la empresa"
                    >
                      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Suspender Convenio
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(e.id, 'aprobada')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      title="Reactivar convenio de colaboración"
                    >
                      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Reactivar Convenio
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
