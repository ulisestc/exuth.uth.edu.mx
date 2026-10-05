'use client';

import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Download, 
  Phone, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Filter, 
  Calendar,
  ExternalLink,
  Award
} from 'lucide-react';
import { 
  Postulacion, 
  VacanteEmpresaItem, 
  downloadCvCandidato, 
  evaluarPostulacion 
} from '@/lib/api';

interface CandidatosManagerProps {
  postulaciones: Postulacion[];
  vacantes: VacanteEmpresaItem[];
  token: string;
  onPostulacionActualizada: (postulacionActualizada: Postulacion) => void;
}

export function CandidatosManager({
  postulaciones,
  vacantes,
  token,
  onPostulacionActualizada,
}: CandidatosManagerProps) {
  const [filtroVacante, setFiltroVacante] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [descargandoCvId, setDescargandoCvId] = useState<number | null>(null);
  const [evaluandoId, setEvaluandoId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtrado reactivo de postulaciones
  const postulacionesFiltradas = postulaciones.filter(p => {
    // Filtro por vacante
    if (filtroVacante !== 'todas' && String(p.vacante) !== filtroVacante) {
      return false;
    }
    // Filtro por estatus
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'turnados' && p.estado !== 'enviada_empresa') return false;
      if (filtroEstado === 'aceptados' && p.estado !== 'Aceptada') return false;
      if (filtroEstado === 'rechazados' && p.estado !== 'Rechazada') return false;
    }
    return true;
  });

  const handleDownloadCv = async (p: Postulacion) => {
    setErrorMsg(null);
    setDescargandoCvId(p.id);

    try {
      const nombreLimpio = p.candidato_nombre?.replace(/\s+/g, '_') || `Egresado_${p.egresado}`;
      const nombreArchivo = `CV_${nombreLimpio}_${p.candidato_matricula || p.egresado}.pdf`;
      const ok = await downloadCvCandidato(token, p.egresado, nombreArchivo);
      if (!ok) {
        if (p.candidato_cv) {
          window.open(p.candidato_cv, '_blank');
        } else {
          setErrorMsg('El candidato no cuenta con un archivo físico de CV disponible.');
        }
      }
    } catch {
      setErrorMsg('Error al descargar el archivo curricular del candidato.');
    } finally {
      setDescargandoCvId(null);
    }
  };

  const handleEvaluar = async (p: Postulacion, nuevoEstado: 'Aceptada' | 'Rechazada') => {
    const accionTexto = nuevoEstado === 'Aceptada' ? 'Aceptar y Contratar' : 'Descartar';
    const confirmacion = window.confirm(
      `¿Confirmas que deseas ${accionTexto.toLowerCase()} al candidato "${p.candidato_nombre || 'Egresado'}" para la vacante "${p.vacante_titulo || 'Oferta'}"?` +
      (nuevoEstado === 'Aceptada' ? '\n\nEsta acción registrará formalmente la Colocación Universitaria del egresado ante la UTH.' : '')
    );

    if (!confirmacion) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setEvaluandoId(p.id);

    try {
      const res = await evaluarPostulacion(token, p.id, nuevoEstado);
      if (res.success) {
        onPostulacionActualizada({ ...p, estado: nuevoEstado });
        setSuccessMsg(
          nuevoEstado === 'Aceptada'
            ? `¡Candidato aceptado exitosamente! Se ha generado el registro de colocación institucional.`
            : `El proceso con el candidato ha sido concluido.`
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo actualizar el estatus del candidato.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al evaluar al candidato.');
    } finally {
      setEvaluandoId(null);
    }
  };

  const formatFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'enviada_empresa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Turnado por UTH · Listo para entrevista
          </span>
        );
      case 'Aceptada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            Aceptado / Contratado · Colocación UTH
          </span>
        );
      case 'Rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
            Proceso Concluido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
            <Filter className="w-4 h-4 text-[#00A887]" />
            <span>Filtrar Vacante:</span>
          </div>
          <select
            value={filtroVacante}
            onChange={(e) => setFiltroVacante(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium text-[#2D2926] bg-white focus:border-[#00A887] outline-none cursor-pointer max-w-xs"
          >
            <option value="todas">Todas mis vacantes ({postulaciones.length} candidatos)</option>
            {vacantes.map(v => (
              <option key={v.id} value={v.id}>
                [{v.clave_vacante}] {v.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de Estatus */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'turnados', label: 'Turnados por UTH' },
            { id: 'aceptados', label: 'Aceptados' },
            { id: 'rechazados', label: 'Concluidos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroEstado(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroEstado === f.id
                  ? 'bg-[#2D2926] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Candidatos */}
      {postulacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#2D2926]">
              {postulaciones.length === 0 
                ? 'Aún no se han turnado candidatos para tus vacantes'
                : 'No se encontraron candidatos con los filtros seleccionados'}
            </h3>
            <p className="text-xs text-[#636569]">
              {postulaciones.length === 0
                ? 'Cuando un egresado aplique y el Departamento de Vinculación UTH valide su perfil académico, su expediente y currículum aparecerán aquí listos para entrevista.'
                : 'Intenta seleccionando otra vacante o cambiando el filtro de estatus para ver más registros.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {postulacionesFiltradas.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 shadow-sm p-6 transition-all space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                      {p.vacante_clave || `VAC-${p.vacante}`}
                    </span>
                    <span className="text-xs font-semibold text-zinc-700">
                      Postuló a: <strong>{p.vacante_titulo || 'Vacante'}</strong>
                    </span>
                    {getEstadoBadge(p.estado)}
                  </div>

                  <h3 className="text-lg font-black text-[#2D2926]">
                    {p.candidato_nombre || 'Egresado UTH'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                      <GraduationCap className="w-3.5 h-3.5 text-[#00A887]" />
                      {p.candidato_carrera || 'Carrera Profesional UTH'}
                    </span>
                    {p.candidato_matricula && (
                      <>
                        <span className="text-zinc-400 hidden sm:inline">•</span>
                        <span className="font-mono text-zinc-600">
                          Matrícula: {p.candidato_matricula}
                        </span>
                      </>
                    )}
                    <span className="text-zinc-400 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Postulado el {formatFecha(p.fecha_postulacion)}
                    </span>
                  </div>
                </div>

                {/* Acciones principales con el CV */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadCv(p)}
                    disabled={descargandoCvId === p.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {descargandoCvId === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Descargar CV (PDF)
                  </button>
                </div>
              </div>

              {/* Datos de Contacto y Habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Contacto */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide">
                    Datos de Contacto Directo:
                  </div>
                  <div className="space-y-1.5">
                    {p.candidato_telefono ? (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#00A887]" />
                        <span className="font-semibold text-[#2D2926]">{p.candidato_telefono}</span>
                        <a
                          href={`https://wa.me/52${p.candidato_telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors"
                        >
                          Enviar WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-zinc-400">Teléfono no registrado</span>
                    )}

                    {p.candidato_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <a 
                          href={`mailto:${p.candidato_email}?subject=Contacto%20Vacante%20${encodeURIComponent(p.vacante_titulo || '')}%20-%20UTH`}
                          className="font-medium text-[#00A887] hover:underline"
                        >
                          {p.candidato_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Competencias y Habilidades */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide">
                    Habilidades y Competencias Reportadas:
                  </div>
                  <p className="text-zinc-700 leading-relaxed">
                    {p.candidato_habilidades || 'El egresado no especificó competencias adicionales en su registro inicial.'}
                  </p>
                </div>
              </div>

              {/* Botones de Decisión y Evaluación */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                <div className="text-[11px] text-[#636569] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A887]" />
                  Expediente validado institucionalmente por la Universidad Tecnológica de Huejotzingo.
                </div>

                <div className="flex items-center gap-2">
                  {p.estado === 'enviada_empresa' && (
                    <>
                      <button
                        onClick={() => handleEvaluar(p, 'Rechazada')}
                        disabled={evaluandoId === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-red-700 hover:bg-red-50 border border-zinc-300 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Descartar
                      </button>

                      <button
                        onClick={() => handleEvaluar(p, 'Aceptada')}
                        disabled={evaluandoId === p.id}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {evaluandoId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Aceptar / Contratar Candidato
                      </button>
                    </>
                  )}

                  {p.estado === 'Aceptada' && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <Award className="w-4 h-4 text-[#00A887]" />
                      Colocación Universitaria Registrada
                    </div>
                  )}

                  {p.estado === 'Rechazada' && (
                    <span className="text-xs text-zinc-500 font-medium">
                      Candidato descartado en este proceso.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
