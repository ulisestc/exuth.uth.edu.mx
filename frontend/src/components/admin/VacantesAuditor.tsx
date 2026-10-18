'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  Users,
  Globe,
  FileText,
  HeartHandshake
} from 'lucide-react';
import { Vacante, fetchAdminVacantes, cambiarStatusVacante } from '@/lib/api';

interface VacantesAuditorProps {
  token: string;
  onStatsChange?: () => void;
}

const NIVEL_LABELS: Record<string, string> = {
  TSU: 'Técnico Superior Universitario (TSU)',
  ING_LIC: 'Ingeniería / Licenciatura',
  MTRIA: 'Maestría / Posgrado',
};

const CONTRATO_LABELS: Record<string, string> = {
  tiempo_completo: 'Tiempo Completo',
  indeterminado: 'Contrato Indeterminado',
  temporal: 'Temporal / Proyecto',
  medio_tiempo: 'Medio Tiempo / Estadía',
};

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  home_office: 'Home Office (Remoto)',
  hibrido: 'Híbrido',
};

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
      if (data.length > 0) {
        setExpandedId(data[0].id);
      } else {
        setExpandedId(null);
      }
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

                      {v.es_inclusiva && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                          <HeartHandshake className="w-3 h-3" />
                          Vacante Inclusiva
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
                        {MODALIDAD_LABELS[v.modalidad] || v.modalidad}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {v.salario_a_tratar 
                          ? 'A tratar' 
                          : v.sueldo_minimo && v.sueldo_maximo 
                            ? `$${Number(v.sueldo_minimo).toLocaleString('es-MX')} - $${Number(v.sueldo_maximo).toLocaleString('es-MX')} MXN`
                            : 'No especificado'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {v.num_candidatos} {v.num_candidatos === 1 ? 'plaza' : 'plazas'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(v.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Ocultar Ficha Técnica
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          Ver Ficha Técnica Completa
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

                {/* Ficha Técnica Completa Desplegable */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-4 border-t border-zinc-200 bg-zinc-50/70 space-y-4 text-xs">
                    {/* Bloque 1: Datos de la Organización Empleadora */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                        <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#00A887] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          1. Organización Empleadora y Contacto Institucional
                        </h4>
                        <Link
                          href={`/empresas/${v.empresa}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A887] hover:underline"
                        >
                          Ver Perfil de Empresa
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-zinc-700">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Razón Social / Nombre</span>
                          <span className="font-semibold text-[#2D2926]">{v.empresa_nombre || 'No especificado'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Giro / Sector</span>
                          <span className="font-medium text-[#2D2926]">
                            {v.empresa_giro || 'N/A'} · {v.empresa_sector || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Actividad Económica</span>
                          <span>{v.empresa_actividad || 'No especificada'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Responsable de la Vacante</span>
                          <span className="font-semibold text-[#2D2926]">{v.persona_contacto}</span>
                          {v.entrevistador && <span className="block text-[11px] text-zinc-500">Entrevistador: {v.entrevistador}</span>}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Correo Electrónico</span>
                          {v.empresa_correo ? (
                            <a href={`mailto:${v.empresa_correo}`} className="inline-flex items-center gap-1 text-[#00A887] font-medium hover:underline">
                              <Mail className="w-3 h-3" />
                              {v.empresa_correo}
                            </a>
                          ) : (
                            <span>No especificado</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Teléfonos de Contacto</span>
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {[v.empresa_telefono && `Oficina: ${v.empresa_telefono}`, v.empresa_celular && `Cel: ${v.empresa_celular}`]
                              .filter(Boolean)
                              .join(' | ') || 'No especificado'}
                          </span>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Domicilio Corporativo</span>
                          <span>{v.empresa_domicilio || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bloque 2 y 3: Perfil Académico/Demográfico y Condiciones Laborales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Perfil Académico y Requisitos Demográficos */}
                      <div className="space-y-2.5 bg-white p-4 rounded-xl border border-zinc-200">
                        <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#691C32] border-b border-zinc-100 pb-2">
                          2. Perfil Académico y Requisitos del Candidato
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Área de Estudio</span>
                            <span className="font-semibold text-[#2D2926]">{v.area_estudio_nombre || `Área #${v.area_estudio}`}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Nivel Académico</span>
                            <span className="font-semibold text-[#2D2926]">{NIVEL_LABELS[v.nivel_estudios] || v.nivel_estudios}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Número de Plazas</span>
                            <span className="font-semibold text-[#2D2926]">{v.num_candidatos} candidato(s)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Rango de Edad</span>
                            <span>{v.edad || 'Indistinto'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Género</span>
                            <span className="capitalize">{v.genero || 'Indistinto'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Estado Civil</span>
                            <span className="capitalize">{v.estado_civil || 'Indistinto'}</span>
                          </div>
                        </div>

                        {/* Inclusión */}
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Inclusión y Accesibilidad</span>
                          <p className="mt-0.5">
                            {v.es_inclusiva
                              ? `Sí es vacante inclusiva (${v.capacidades_especiales || 'Adaptaciones disponibles'})`
                              : 'Estándar (Sin requerimientos especiales especificados)'}
                          </p>
                        </div>

                        {/* Idiomas */}
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Idiomas Requeridos</span>
                          {v.idiomas && v.idiomas.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {v.idiomas.map((req, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-[#2D2926]"
                                >
                                  <Globe className="w-3 h-3 text-[#00A887]" />
                                  {req.idioma_nombre || `Idioma #${req.idioma}`} · Nivel {req.nivel} ({req.obligatorio ? 'Obligatorio' : 'Deseable'})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-500">Sin requisito de idioma extranjero</span>
                          )}
                        </div>
                      </div>

                      {/* Condiciones Laborales, Prestaciones y Documentos */}
                      <div className="space-y-2.5 bg-white p-4 rounded-xl border border-zinc-200">
                        <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#00A887] border-b border-zinc-100 pb-2">
                          3. Condiciones Laborales, Prestaciones y Documentos
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Tipo de Contratación</span>
                            <span className="font-semibold text-[#2D2926]">{CONTRATO_LABELS[v.tipo_contratacion] || v.tipo_contratacion}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Modalidad</span>
                            <span className="font-semibold text-[#2D2926]">{MODALIDAD_LABELS[v.modalidad] || v.modalidad}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Horario de Trabajo</span>
                            <span>{v.horario_trabajo || 'No especificado'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Transporte de Personal</span>
                            <span className={v.incluye_transporte ? 'font-bold text-emerald-700' : 'text-zinc-600'}>
                              {v.incluye_transporte ? 'Sí incluye transporte' : 'No incluye transporte'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Servicio de Comedor</span>
                            <span className={v.incluye_comedor ? 'font-bold text-emerald-700' : 'text-zinc-600'}>
                              {v.incluye_comedor ? 'Sí incluye comedor' : 'No incluye comedor'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Prestaciones Ofrecidas</span>
                          <p className="mt-0.5 text-zinc-700">{v.prestaciones || 'Prestaciones de ley'}</p>
                        </div>

                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#691C32]" />
                            Documentos Requeridos para el Empleo
                          </span>
                          <p className="mt-0.5 font-medium text-[#2D2926]">{v.documentos_requeridos || 'Currículum Vitae'}</p>
                        </div>

                        {v.observaciones && (
                          <div className="pt-2 border-t border-zinc-100">
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Observaciones Adicionales</span>
                            <p className="mt-0.5 text-zinc-700">{v.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bloque 4: Competencias Técnicas, Experiencia y Responsabilidades */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
                      <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#2D2926] border-b border-zinc-100 pb-2">
                        4. Experiencia, Competencias y Responsabilidades del Puesto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-700">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Experiencia Requerida</span>
                          <p className="mt-0.5">{v.experiencia || 'No especificada'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Responsabilidades y Actividades</span>
                          <p className="mt-0.5">{v.responsabilidades || 'No especificadas'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Conocimientos Técnicos</span>
                          <p className="mt-0.5">{v.conocimientos || 'No especificados'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Habilidades y Actitudes</span>
                          <p className="mt-0.5">
                            <strong>Habilidades:</strong> {v.habilidades || 'N/A'} <br />
                            <strong>Actitudes:</strong> {v.actitudes || 'N/A'}
                          </p>
                        </div>
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
