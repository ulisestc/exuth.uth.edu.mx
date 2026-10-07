'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { 
  Postulacion, 
  fetchAdminPostulaciones, 
  turnarPostulacionEmpresa, 
  rechazarPostulacionUth, 
  downloadCvCandidato 
} from '@/lib/api';

interface PostulacionesFiltroProps {
  token: string;
  onStatsChange?: () => void;
}

export default function PostulacionesFiltro({ token, onStatsChange }: PostulacionesFiltroProps) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [filterEstado, setFilterEstado] = useState<string>('revision_uth');
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal para agregar notas UTH al turnar o descartar
  const [actionModal, setActionModal] = useState<{
    postulacion: Postulacion;
    tipo: 'turnar' | 'rechazar';
  } | null>(null);
  const [notasUthInput, setNotasUthInput] = useState<string>('');

  const loadPostulaciones = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchAdminPostulaciones(token, filterEstado);
      setPostulaciones(data);
    } catch (err) {
      console.error('Error cargando postulaciones para filtro UTH:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostulaciones();
  }, [filterEstado]);

  const handleDownloadCv = async (postulacion: Postulacion) => {
    setDownloadingId(postulacion.id);
    const nombreArchivo = `CV_${postulacion.candidato_matricula || postulacion.egresado}_${postulacion.candidato_nombre?.replace(/\s+/g, '_')}.pdf`;
    const ok = await downloadCvCandidato(token, postulacion.egresado, nombreArchivo);
    setDownloadingId(null);
    if (!ok) {
      alert('El egresado no cuenta con un archivo PDF de currículum cargado o no se pudo descargar.');
    }
  };

  const openActionModal = (p: Postulacion, tipo: 'turnar' | 'rechazar') => {
    setActionModal({ postulacion: p, tipo });
    setNotasUthInput(
      tipo === 'turnar' 
        ? 'Candidato validado por Dirección de Vinculación UTH - Perfil afín a la vacante.' 
        : 'Perfil no compatible con los requisitos de la vacante.'
    );
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    const { postulacion, tipo } = actionModal;

    setProcessingId(postulacion.id);
    setFeedback(null);

    let res;
    if (tipo === 'turnar') {
      res = await turnarPostulacionEmpresa(token, postulacion.id, notasUthInput);
    } else {
      res = await rechazarPostulacionUth(token, postulacion.id, notasUthInput);
    }

    setProcessingId(null);
    setActionModal(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: tipo === 'turnar'
          ? `Postulación turnada con éxito a la empresa. El empleador ya puede contactar al egresado.`
          : `Postulación descartada en filtro institucional.`
      });
      loadPostulaciones();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Ocurrió un error al procesar el dictamen de la postulación.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#636569] uppercase tracking-wider mr-2">Filtro UTH:</span>
          {[
            { id: 'revision_uth', label: 'Por Turnar (En Revisión UTH)' },
            { id: 'enviada_empresa', label: 'Turnadas a Empresa' },
            { id: 'Aceptada', label: 'Colocados / Contratados' },
            { id: 'rechazada_uth', label: 'Descartadas UTH' },
            { id: 'todas', label: 'Todas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterEstado(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterEstado === tab.id
                  ? 'bg-[#691C32] text-white shadow-sm'
                  : 'bg-zinc-100 text-[#2D2926] hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadPostulaciones}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#636569] hover:text-[#2D2926] hover:bg-zinc-100 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
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
            className="text-xs font-bold ml-4 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Listado de Postulaciones */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-[#691C32] animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Consultando candidatos y solicitudes registradas...</p>
        </div>
      ) : postulaciones.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200 p-8">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2D2926]">No hay postulaciones en este estatus</h3>
          <p className="text-xs text-[#636569] max-w-sm mx-auto">
            {filterEstado === 'revision_uth'
              ? 'Excelente: No hay candidatos pendientes de filtro institucional por turnar a las empresas.'
              : 'No se encontraron postulaciones registradas en este criterio.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {postulaciones.map((p) => {
            const isProcessing = processingId === p.id;
            const isDownloading = downloadingId === p.id;

            return (
              <div 
                key={p.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 sm:p-6 space-y-4 hover:border-zinc-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Datos del Candidato */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-[#2D2926] border border-zinc-200">
                        Matrícula: {p.candidato_matricula || 'No asignada'}
                      </span>

                      {p.estado === 'revision_uth' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pendiente de Filtro UTH (Por Turnar)
                        </span>
                      )}
                      {p.estado === 'enviada_empresa' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          <Send className="w-3 h-3" />
                          Turnado a Empresa · Visible para Empleador
                        </span>
                      )}
                      {p.estado === 'Aceptada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Contratado · Colocación Universitaria Registrada
                        </span>
                      )}
                      {p.estado === 'rechazada_uth' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Descartado por UTH
                        </span>
                      )}
                      {p.estado === 'Rechazada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          Proceso Concluido por Empresa
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#2D2926]">
                      {p.candidato_nombre || 'Egresado Registrado'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#00A887]">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {p.candidato_carrera || 'Carrera UTH'} ({p.candidato_nivel_estudios || 'TSU/ING'})
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2D2926]">
                        <Briefcase className="w-3.5 h-3.5 text-[#691C32]" />
                        Vacante: {p.vacante_titulo || `#${p.vacante}`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#C2BA98]" />
                        {p.vacante_empresa || 'Empresa Empleadora'}
                      </span>
                    </div>

                    {/* Contacto Directo */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      {p.candidato_telefono && (
                        <a 
                          href={`tel:${p.candidato_telefono}`}
                          className="inline-flex items-center gap-1 text-zinc-600 hover:text-[#00A887] font-medium"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {p.candidato_telefono}
                        </a>
                      )}
                      {p.candidato_email && (
                        <a 
                          href={`mailto:${p.candidato_email}`}
                          className="inline-flex items-center gap-1 text-zinc-600 hover:text-[#00A887] font-medium"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {p.candidato_email}
                        </a>
                      )}
                    </div>

                    {/* Habilidades y Observaciones */}
                    {p.candidato_habilidades && (
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                        <strong className="text-[#2D2926]">Competencias:</strong> {p.candidato_habilidades}
                      </p>
                    )}

                    {p.notas_uth && (
                      <div className="text-xs p-2.5 rounded-lg bg-amber-50/70 text-amber-900 border border-amber-200">
                        <strong className="font-bold flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-amber-700" />
                          Notas Institucionales de Vinculación:
                        </strong>
                        <p className="mt-0.5">{p.notas_uth}</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones de Vinculación */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 pt-2 md:pt-0 w-full sm:w-auto">
                    {/* Botón Descargar CV */}
                    <button
                      onClick={() => handleDownloadCv(p)}
                      disabled={isDownloading}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-all cursor-pointer disabled:opacity-50"
                      title="Auditar Currículum Vitae en PDF"
                    >
                      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#00A887]" />}
                      Auditar CV (PDF)
                    </button>

                    {/* Botón Turnar a Empresa */}
                    {p.estado === 'revision_uth' && (
                      <button
                        onClick={() => openActionModal(p, 'turnar')}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title="Aprobar pertinencia y enviar a la empresa"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Turnar a Empresa
                      </button>
                    )}

                    {/* Botón Descartar */}
                    {(p.estado === 'revision_uth' || p.estado === 'enviada_empresa') && (
                      <button
                        onClick={() => openActionModal(p, 'rechazar')}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#691C32] hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                        title="Descartar postulación en filtro"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Descartar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Dictamen (Notas UTH) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2D2926]">
                {actionModal.tipo === 'turnar' ? 'Turnar Candidato a Empresa' : 'Descartar Postulación de Egresado'}
              </h3>
              <p className="text-xs text-[#636569]">
                Candidato: <strong className="text-[#2D2926]">{actionModal.postulacion.candidato_nombre}</strong> para la vacante <strong className="text-[#2D2926]">{actionModal.postulacion.vacante_titulo}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2926]">
                Observaciones Institucionales UTH (Opcional):
              </label>
              <textarea
                value={notasUthInput}
                onChange={(e) => setNotasUthInput(e.target.value)}
                rows={3}
                placeholder="Escribe comentarios de pertinencia o motivo de descarte..."
                className="w-full text-xs p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
              />
              <p className="text-[11px] text-[#636569]">
                {actionModal.tipo === 'turnar'
                  ? 'Estas notas serán visibles para la empresa empleadora cuando revise el perfil del egresado.'
                  : 'Estas notas quedarán registradas en la bitácora interna de vinculación.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#636569] hover:bg-zinc-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={processingId !== null}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                  actionModal.tipo === 'turnar'
                    ? 'bg-[#00A887] hover:bg-[#008F73]'
                    : 'bg-[#691C32] hover:bg-[#521627]'
                }`}
              >
                {processingId !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {actionModal.tipo === 'turnar' ? 'Confirmar y Turnar' : 'Confirmar Descarte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
