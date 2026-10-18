'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchMisPostulaciones, 
  crearPostulacion, 
  Postulacion,
  fetchMiPerfilEgresado,
  EgresadoProfile,
  uploadMiCv,
  uploadMisDocumentos
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';
import { 
  Send, 
  CheckCircle2, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  UploadCloud,
  FolderOpen,
  Eye,
  Plus
} from 'lucide-react';

interface ApplyButtonProps {
  vacanteId: number;
  vacanteTitulo: string;
  empresaNombre?: string;
  documentosRequeridos?: string;
}

const TIPOS_DOCUMENTO_SUGERIDOS = [
  'Expediente Consolidado (INE, CURP, RFC, Comprobante)',
  'Título Profesional y Cédula',
  'Carta de Pasante / Kardex Oficial',
  'Identificación Oficial (INE) y CURP',
  'Pasaporte / Visa / Licencia de Manejo',
  'Certificado de Idioma / Certificaciones Técnicas',
  'Otro documento requerido por la vacante',
];

export const ApplyButton: React.FC<ApplyButtonProps> = ({
  vacanteId,
  vacanteTitulo,
  empresaNombre = 'Empresa UTH',
  documentosRequeridos,
}) => {
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isApplied, setIsApplied] = useState(false);
  const [applicationData, setApplicationData] = useState<Postulacion | null>(null);
  const [profile, setProfile] = useState<EgresadoProfile | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [newlyUploadedDocIds, setNewlyUploadedDocIds] = useState<number[]>([]);
  const [newlyUploadedCv, setNewlyUploadedCv] = useState<string | null>(null);
  const [nuevoDocTipo, setNuevoDocTipo] = useState<string>(TIPOS_DOCUMENTO_SUGERIDOS[0]);
  const [nuevoDocNombrePersonalizado, setNuevoDocNombrePersonalizado] = useState<string>('');

  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [previewConfig, setPreviewConfig] = useState<{
    tipo: 'cv' | 'documentos';
    docId?: number;
    docNombre?: string;
  } | null>(null);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const getFileDisplayName = (pathStr?: string | null, fallback = 'Documento_UTH.pdf') => {
    if (!pathStr) return '';
    try {
      const parts = pathStr.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    async function checkExistingApplicationAndProfile() {
      if (authLoading) return;

      if (isAuthenticated && user?.rol === 'egresado' && accessToken) {
        try {
          const [misPostulaciones, miPerfil] = await Promise.all([
            fetchMisPostulaciones(accessToken),
            fetchMiPerfilEgresado(accessToken),
          ]);
          setProfile(miPerfil);
          if (miPerfil?.documentos_precargados) {
            setSelectedDocIds(miPerfil.documentos_precargados.map((d) => d.id));
          }
          const found = misPostulaciones.find((p) => p.vacante === vacanteId);
          if (found) {
            setIsApplied(true);
            setApplicationData(found);
          }
        } catch (err) {
          console.error('Error checking existing application:', err);
        }
      }
      setIsChecking(false);
    }

    checkExistingApplicationAndProfile();
  }, [authLoading, isAuthenticated, user, accessToken, vacanteId]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!accessToken || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setErrorMsg(null);
    setUploadSuccessMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('El Currículum Vitae debe estar en formato PDF (.pdf).');
      return;
    }

    setIsUploadingCv(true);
    const res = await uploadMiCv(accessToken, file);
    setIsUploadingCv(false);
    if (cvInputRef.current) cvInputRef.current.value = '';

    if (res.success && res.profile) {
      setProfile(res.profile);
      setNewlyUploadedCv(file.name);
      setUploadSuccessMsg(`Currículum Vitae "${file.name}" subido y seleccionado correctamente.`);
    } else {
      setErrorMsg(res.error || 'No se pudo subir el archivo de CV.');
    }
  };

  const handleDocsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!accessToken || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setErrorMsg(null);
    setUploadSuccessMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Los documentos adicionales deben subirse en formato PDF (.pdf).');
      return;
    }

    const etiquetaFinal =
      nuevoDocTipo === 'Otro documento requerido por la vacante'
        ? nuevoDocNombrePersonalizado.trim() || file.name.replace(/\.pdf$/i, '')
        : nuevoDocTipo;

    const prevIds = new Set((profile?.documentos_precargados || []).map((d) => d.id));

    setIsUploadingDocs(true);
    const res = await uploadMisDocumentos(accessToken, file, etiquetaFinal);
    setIsUploadingDocs(false);
    if (docsInputRef.current) docsInputRef.current.value = '';

    if (res.success && res.profile) {
      setProfile(res.profile);
      const nuevosDocs = (res.profile.documentos_precargados || []).filter((d) => !prevIds.has(d.id));
      const nuevosIds = nuevosDocs.map((d) => d.id);
      if (nuevosIds.length > 0) {
        setSelectedDocIds((prev) => Array.from(new Set([...prev, ...nuevosIds])));
        setNewlyUploadedDocIds((prev) => Array.from(new Set([...prev, ...nuevosIds])));
      } else if (res.profile.documentos_precargados?.length) {
        const firstId = res.profile.documentos_precargados[0].id;
        setSelectedDocIds((prev) => Array.from(new Set([...prev, firstId])));
        setNewlyUploadedDocIds((prev) => Array.from(new Set([...prev, firstId])));
      }
      setNuevoDocNombrePersonalizado('');
      setUploadSuccessMsg(
        `Documento adicional "${etiquetaFinal}" (${file.name}) subido exitosamente y seleccionado para tu postulación.`
      );
    } else {
      setErrorMsg(res.error || 'No se pudo subir el archivo de documentos adicionales.');
    }
  };

  const toggleDocSelection = (docId: number) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleApply = async () => {
    if (!accessToken) return;
    if (!profile?.cv) {
      setErrorMsg('Debes adjuntar tu Currículum Vitae (CV) en formato PDF antes de poder postularte.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await crearPostulacion(vacanteId, accessToken, {
      incluir_documentos: selectedDocIds.length > 0,
      documentos_ids: selectedDocIds,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      setIsApplied(true);
      setApplicationData(result.data);
      setShowModal(false);
      const docsCount = selectedDocIds.length;
      setSuccessMsg(
        docsCount > 0
          ? `Postulación enviada exitosamente con tu CV y ${docsCount} documento(s) adicional(es) adjunto(s).`
          : 'Postulación enviada exitosamente con tu CV institucional.'
      );
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al enviar tu postulación.');
    }
  };

  const getEstadoLabel = (estado?: string) => {
    switch (estado) {
      case 'revision_uth':
        return 'En Revisión por UTH';
      case 'enviada_empresa':
        return 'Enviada a Empresa';
      case 'Aceptada':
        return 'Postulación Aceptada';
      case 'Rechazada':
        return 'Proceso Concluido';
      case 'rechazada_uth':
        return 'No cubre perfil UTH';
      default:
        return 'Postulado';
    }
  };

  if (authLoading || isChecking) {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-500 bg-zinc-100 rounded-lg w-full sm:w-auto">
        <Loader2 className="w-4 h-4 animate-spin text-[#00A887]" />
        Verificando estado...
      </div>
    );
  }

  // 1. Caso: Usuario No Autenticado
  if (!isAuthenticated || !user) {
    return (
      <Link
        href={`/login?redirect=/vacantes/${vacanteId}`}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all w-full sm:w-auto"
      >
        <Send className="w-4 h-4" />
        Postularme a esta Vacante
      </Link>
    );
  }

  // 2. Caso: Rol Empresa o Administrador
  if (user.rol !== 'egresado') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-600">
        <Lock className="w-3.5 h-3.5 text-zinc-400" />
        Postulación exclusiva para Egresados UTH
      </div>
    );
  }

  // 3. Caso: Egresado Ya Postulado
  if (isApplied) {
    const adjuntos = applicationData?.candidato_lista_documentos || [];
    return (
      <div className="space-y-2">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-900 max-w-xs">
            <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#00A887]">
          <CheckCircle2 className="w-4 h-4 text-[#00A887]" />
          <span>Postulado · {getEstadoLabel(applicationData?.estado)}</span>
        </div>
        <div className="text-[11px] text-[#636569]">
          Expediente enviado: CV Oficial
          {adjuntos.length > 0 ? ` + ${adjuntos.length} documento(s) anexo(s)` : ''}
        </div>
        <div>
          <Link
            href="/portal-egresado"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A887] hover:underline"
          >
            Ver estatus en mi portal
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  const hasCv = Boolean(profile?.cv);
  const docsPrecargados = profile?.documentos_precargados || [];

  // 4. Caso: Egresado Disponible para Postularse
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMsg(null);
          setUploadSuccessMsg(null);
          setShowModal(true);
        }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all w-full sm:w-auto cursor-pointer"
      >
        <Send className="w-4 h-4" />
        Postularme a esta Vacante
      </button>

      {/* Modal Institucional de Confirmación y Selección de Expediente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden relative my-8 max-h-[92vh] flex flex-col">
            {/* Pleca Bicolor */}
            <div className="w-full h-1.5 flex shrink-0">
              <div className="h-full w-2/3 bg-[#691C32]" />
              <div className="h-full w-1/3 bg-[#C2BA98]" />
            </div>

            <input
              type="file"
              ref={cvInputRef}
              onChange={handleCvUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <input
              type="file"
              ref={docsInputRef}
              onChange={handleDocsUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00A887] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Bolsa de Trabajo UTH · Selección de Expediente
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#2D2926]">
                  Confirmar Postulación y Documentos Adjuntos
                </h3>
                <p className="text-xs text-[#636569] mt-1 leading-relaxed">
                  Puesto: <strong className="text-[#2D2926]">{vacanteTitulo}</strong> en{' '}
                  <strong className="text-[#2D2926]">{empresaNombre}</strong>. Selecciona los documentos pre-cargados de tu perfil o sube nuevos archivos PDF.
                </p>
              </div>

              {/* Retroalimentación inmediata cuando se sube un CV o Documento Adicional */}
              {uploadSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
                  <div className="flex-1 font-semibold">{uploadSuccessMsg}</div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-[#A8123E] shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Documentos solicitados por la empresa */}
              {documentosRequeridos && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                    Documentación solicitada por la empresa para esta vacante:
                  </p>
                  <p className="font-medium">{documentosRequeridos}</p>
                </div>
              )}

              {/* 1. CV Pre-cargado (Obligatorio) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D2926]">
                    1. Currículum Vitae Institucional (Obligatorio)
                  </span>
                  {hasCv && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {newlyUploadedCv ? 'RECIÉN SUBIDO Y SELECCIONADO' : 'PRE-CARGADO · SELECCIONADO'}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    hasCv
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        hasCv ? 'bg-[#00A887] text-white' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {hasCv ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-[#2D2926] break-all">
                        {hasCv
                          ? newlyUploadedCv || getFileDisplayName(profile?.cv, `CV_${profile?.matricula}.pdf`)
                          : 'Sin Currículum Vitae cargado'}
                      </p>
                      <p className="text-[11px] text-[#636569]">
                        {hasCv
                          ? 'Archivo PDF listo en tu expediente. Se incluirá obligatoriamente en tu postulación.'
                          : 'Es obligatorio subir tu CV en formato PDF para poder postularte.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasCv && (
                      <button
                        type="button"
                        onClick={() => setPreviewConfig({ tipo: 'cv', docNombre: 'Currículum Vitae' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#691C32] bg-white border border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver PDF
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      disabled={isUploadingCv}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasCv
                          ? 'bg-white border border-zinc-300 text-[#2D2926] hover:bg-zinc-50'
                          : 'bg-[#00A887] text-white hover:bg-[#008F73]'
                      }`}
                    >
                      {isUploadingCv ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      {hasCv ? 'Reemplazar CV' : 'Subir CV (PDF)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Selección de Documentos Pre-cargados y Subida de Nuevos Anexos */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D2926] block">
                      2. Documentos Adicionales Pre-cargados ({selectedDocIds.length} seleccionados)
                    </span>
                    <span className="text-[11px] text-[#636569]">
                      Marca los documentos pre-cargados en tu perfil que deseas anexar a esta vacante o sube uno nuevo.
                    </span>
                  </div>

                  {docsPrecargados.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedDocIds(docsPrecargados.map((d) => d.id))}
                        className="font-bold text-[#00A887] hover:underline cursor-pointer"
                      >
                        Seleccionar todos
                      </button>
                      <span className="text-zinc-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedDocIds([])}
                        className="font-semibold text-zinc-500 hover:underline cursor-pointer"
                      >
                        Desmarcar todos
                      </button>
                    </div>
                  )}
                </div>

                {/* Lista de documentos pre-cargados seleccionables */}
                {docsPrecargados.length > 0 ? (
                  <div className="space-y-2">
                    {docsPrecargados.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      const isNewlyUploaded = newlyUploadedDocIds.includes(doc.id);

                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleDocSelection(doc.id)}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300 cursor-pointer"
                            />
                            <div className="text-xs space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-[#2D2926]">{doc.nombre}</span>
                                {isNewlyUploaded ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A887] text-white">
                                    RECIÉN SUBIDO
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 text-zinc-700">
                                    PRE-CARGADO
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    SELECCIONADO PARA ENVÍO
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#636569] break-all">
                                Archivo PDF: <strong className="text-[#2D2926]">{doc.archivo_nombre}</strong>
                              </p>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewConfig({
                                  tipo: 'documentos',
                                  docId: doc.id,
                                  docNombre: doc.nombre,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#691C32] bg-white border border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver PDF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-[#636569]">
                    No tienes documentos adicionales pre-cargados en tu perfil todavía. Puedes subir uno a continuación.
                  </div>
                )}

                {/* Subir un nuevo documento adicional desde el modal */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                    <FolderOpen className="w-4 h-4 text-[#691C32]" />
                    <span>Agregar un nuevo documento adicional a mi expediente (PDF)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 space-y-2">
                      <select
                        value={nuevoDocTipo}
                        onChange={(e) => setNuevoDocTipo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      >
                        {TIPOS_DOCUMENTO_SUGERIDOS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      {nuevoDocTipo === 'Otro documento requerido por la vacante' && (
                        <input
                          type="text"
                          value={nuevoDocNombrePersonalizado}
                          onChange={(e) => setNuevoDocNombrePersonalizado(e.target.value)}
                          placeholder="Escribe el nombre del documento (ej. Licencia Tipo B)"
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => docsInputRef.current?.click()}
                      disabled={isUploadingDocs}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#2D2926] hover:bg-black transition-all cursor-pointer disabled:opacity-50 h-fit"
                    >
                      {isUploadingDocs ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A887]" />
                          Subiendo PDF...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#00A887]" />
                          Subir Nuevo PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen del envío */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#636569] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#2D2926]">Resumen de documentos a enviar: </span>
                  <span>
                    {hasCv ? '1 CV Oficial' : '0 CV'} + {selectedDocIds.length} documento(s) adicional(es) seleccionado(s).
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 shrink-0">
                  Estatus inicial: En Revisión por UTH
                </span>
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#2D2926] bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || !hasCv}
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enviando Postulación...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Confirmar y Enviar Postulación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de PDF en línea dentro del flujo de postulación */}
      {previewConfig && accessToken && (
        <CvViewerModal
          isOpen={true}
          onClose={() => setPreviewConfig(null)}
          candidatoNombre={`${user.nombres} ${user.apellido_paterno}`}
          matricula={profile?.matricula}
          token={accessToken}
          tipo={previewConfig.tipo}
          isOwnProfile={true}
          docId={previewConfig.docId}
          docNombre={previewConfig.docNombre}
        />
      )}
    </>
  );
};
