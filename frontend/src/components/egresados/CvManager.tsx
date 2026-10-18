'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  FileCheck,
  ShieldCheck,
  Eye,
  Download,
  FolderOpen,
  Plus
} from 'lucide-react';
import { 
  EgresadoProfile, 
  uploadMiCv, 
  deleteMiCv, 
  downloadMiCv,
  uploadMisDocumentos,
  deleteMisDocumentos,
  downloadMisDocumentos
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';

interface CvManagerProps {
  profile: EgresadoProfile | null;
  token: string;
  onProfileUpdated: (updatedProfile: EgresadoProfile) => void;
}

const TIPOS_DOCUMENTO_CATALOGO = [
  'Título Profesional y Cédula',
  'INE, CURP y Constancia Fiscal (RFC)',
  'Carta de Pasante / Kardex Oficial',
  'Pasaporte / Visa / Licencia de Manejo',
  'Certificado de Idioma / Certificaciones Técnicas',
  'Expediente Consolidado General',
  'Otro documento laboral',
];

export function CvManager({ profile, token, onProfileUpdated }: CvManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [newlyUploadedDocIds, setNewlyUploadedDocIds] = useState<number[]>([]);
  const [nuevoDocTipo, setNuevoDocTipo] = useState<string>(TIPOS_DOCUMENTO_CATALOGO[0]);
  const [nuevoDocPersonalizado, setNuevoDocPersonalizado] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [viewerConfig, setViewerConfig] = useState<{
    tipo: 'cv' | 'documentos';
    docId?: number;
    docNombre?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const hasCv = Boolean(profile?.cv);
  const docsPrecargados = profile?.documentos_precargados || [];

  const getFileDisplayName = (pathStr?: string | null, fallback = 'Documento_UTH.pdf') => {
    if (!pathStr) return '';
    try {
      const parts = pathStr.split('/');
      const rawName = parts[parts.length - 1];
      return decodeURIComponent(rawName);
    } catch {
      return fallback;
    }
  };

  const handleFileValidationAndUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Solo se admiten documentos en formato PDF (.pdf).');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`El archivo excede el tamaño máximo permitido de ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadMiCv(token, file);
      if (result.success && result.profile) {
        onProfileUpdated(result.profile);
        setSuccessMsg(`Currículum Vitae "${file.name}" cargado y vinculado exitosamente a tu perfil UTH.`);
      } else {
        setErrorMsg(result.error || 'No se pudo cargar el archivo curricular.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al cargar el CV.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDocsValidationAndUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('El documento adicional debe estar en formato PDF (.pdf).');
      return;
    }

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`El archivo de documentos excede el tamaño máximo permitido de ${MAX_SIZE_MB} MB.`);
      return;
    }

    const etiquetaFinal =
      nuevoDocTipo === 'Otro documento laboral'
        ? nuevoDocPersonalizado.trim() || file.name.replace(/\.pdf$/i, '')
        : nuevoDocTipo;

    const prevIds = new Set(docsPrecargados.map((d) => d.id));

    setIsUploadingDocs(true);
    try {
      const result = await uploadMisDocumentos(token, file, etiquetaFinal);
      if (result.success && result.profile) {
        onProfileUpdated(result.profile);
        const nuevos = (result.profile.documentos_precargados || [])
          .filter((d) => !prevIds.has(d.id))
          .map((d) => d.id);
        if (nuevos.length > 0) {
          setNewlyUploadedDocIds((prev) => Array.from(new Set([...prev, ...nuevos])));
        }
        setNuevoDocPersonalizado('');
        setSuccessMsg(
          `Documento adicional "${etiquetaFinal}" (${file.name}) pre-cargado correctamente en tu expediente. Ya puedes seleccionarlo al postularte.`
        );
      } else {
        setErrorMsg(result.error || 'No se pudo cargar el documento adicional.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al cargar el documento.');
    } finally {
      setIsUploadingDocs(false);
      if (docsInputRef.current) {
        docsInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidationAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidationAndUpload(e.target.files[0]);
    }
  };

  const handleDocsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDocsValidationAndUpload(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    setErrorMsg(null);
    setIsDownloading(true);
    try {
      const filename = `CV_${profile?.matricula || 'Egresado_UTH'}.pdf`;
      const ok = await downloadMiCv(token, filename);
      if (!ok) {
        setErrorMsg('No se pudo descargar el archivo curricular.');
      }
    } catch {
      setErrorMsg('Error al descargar el archivo curricular.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDocItem = async (docId: number, archivoNombre: string) => {
    setErrorMsg(null);
    setDownloadingDocId(docId);
    try {
      const ok = await downloadMisDocumentos(token, archivoNombre || 'Documento_UTH.pdf', docId);
      if (!ok) {
        setErrorMsg('No se pudo descargar el documento seleccionado.');
      }
    } catch {
      setErrorMsg('Error al descargar el documento seleccionado.');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Confirmas que deseas eliminar tu Currículum Vitae del sistema? No podrás postularte a vacantes hasta que subas uno nuevo.')) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDeleting(true);

    try {
      const result = await deleteMiCv(token);
      if (result.success) {
        if (profile) {
          onProfileUpdated({ ...profile, cv: null });
        }
        setSuccessMsg('Currículum Vitae eliminado correctamente.');
      } else {
        setErrorMsg(result.error || 'No se pudo eliminar el archivo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al eliminar el archivo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDocItem = async (docId: number, nombreDoc: string) => {
    if (!window.confirm(`¿Confirmas que deseas eliminar el documento pre-cargado "${nombreDoc}"?`)) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingDocId(docId);

    try {
      const result = await deleteMisDocumentos(token, docId);
      if (result.success) {
        if (result.profile) {
          onProfileUpdated(result.profile);
        } else if (profile) {
          const restantes = (profile.documentos_precargados || []).filter((d) => d.id !== docId);
          onProfileUpdated({
            ...profile,
            documentos_precargados: restantes,
            documentos: restantes.length > 0 ? restantes[0].archivo : null,
          });
        }
        setSuccessMsg(`Documento "${nombreDoc}" eliminado de tu expediente pre-cargado.`);
      } else {
        setErrorMsg(result.error || 'No se pudo eliminar el documento.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al eliminar el documento.');
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <div id="seccion-cv" className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6 scroll-mt-6">
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00A887] uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Expediente Digital Profesional
          </div>
          <h2 className="text-xl font-black text-[#2D2926] tracking-tight">
            Currículum Vitae y Documentos Pre-cargados para el Empleo
          </h2>
          <p className="text-xs text-[#636569]">
            Tu CV es obligatorio. Además, puedes pre-cargar documentos adicionales (Título, Cédula, INE, CURP, Licencias, Certificados) para seleccionarlos con un clic al postularte.
          </p>
        </div>

        {/* Badge de Estatus */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {hasCv ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
              CV Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              CV Pendiente
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 text-[#2D2926] border border-zinc-200">
            <FolderOpen className="w-3.5 h-3.5 text-[#691C32]" />
            {docsPrecargados.length} Doc(s) Pre-cargado(s)
          </span>
        </div>
      </div>

      {/* Mensajes de Retroalimentación */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 text-xs animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{successMsg}</div>
        </div>
      )}

      {/* Inputs ocultos para selección de archivos */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />
      <input 
        type="file"
        ref={docsInputRef}
        onChange={handleDocsInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* 1. Estado: CV */}
      {hasCv ? (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#2D2926] break-all">
                    {getFileDisplayName(profile?.cv, 'Curriculum_UTH.pdf')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 tracking-wide">
                    CV OFICIAL PRE-CARGADO
                  </span>
                </div>
                <p className="text-xs text-[#636569] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A887]" />
                  Currículum Vitae protegido y listo para postularse a cualquier vacante.
                </p>
              </div>
            </div>

            {/* Botones de acción para el CV */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewerConfig({ tipo: 'cv', docNombre: 'Currículum Vitae Oficial' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#691C32] hover:bg-[#521627] transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#C2BA98]" />
                Ver en Línea
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-[#2D2926] bg-white border border-zinc-300 hover:bg-zinc-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A887]" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#00A887]" />
                )}
                Descargar
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Reemplazar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50 cursor-pointer"
                title="Eliminar currículum"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Estado: Sin CV -> Dropzone interactivo */
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
              isDragging 
                ? 'border-[#00A887] bg-emerald-50/70 scale-[1.01]' 
                : 'border-zinc-300 hover:border-[#00A887] bg-zinc-50/50 hover:bg-emerald-50/20'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-[#00A887] text-white' : 'bg-emerald-50 text-[#00A887]'
            }`}>
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1 max-w-md">
              <p className="text-sm font-bold text-[#2D2926]">
                {isUploading 
                  ? 'Subiendo y verificando documento...' 
                  : 'Arrastra y suelta tu Currículum Vitae (CV) aquí o haz clic para examinar'}
              </p>
              <p className="text-xs text-[#636569]">
                Formato obligatorio: <strong className="text-[#2D2926]">PDF (.pdf)</strong> · Tamaño máximo: <strong className="text-[#2D2926]">5 MB</strong>
              </p>
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm disabled:opacity-50 cursor-pointer pointer-events-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Seleccionar CV en PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. Sección: Biblioteca de Documentos Adicionales Pre-cargados */}
      <div className="pt-5 border-t border-zinc-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#2D2926] flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#691C32]" />
            Documentos Adicionales Pre-cargados ({docsPrecargados.length})
          </h3>
          <p className="text-xs text-[#636569] mt-0.5">
            Pre-carga aquí tus documentos probatorios en formato PDF (Título, Cédula, INE, CURP, Pasaporte, Visa, Licencia, Certificados). Al postularte a una vacante podrás elegir cuáles adjuntar.
          </p>
        </div>

        {/* Barra para subir un nuevo documento pre-cargado */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <label className="block text-xs font-bold text-[#2D2926]">
            Pre-cargar nuevo documento adicional en mi expediente (PDF, máx. 10 MB):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div className="sm:col-span-2 space-y-2">
              <select
                value={nuevoDocTipo}
                onChange={(e) => setNuevoDocTipo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#00A887]"
              >
                {TIPOS_DOCUMENTO_CATALOGO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {nuevoDocTipo === 'Otro documento laboral' && (
                <input
                  type="text"
                  value={nuevoDocPersonalizado}
                  onChange={(e) => setNuevoDocPersonalizado(e.target.value)}
                  placeholder="Nombre del documento (ej. Licencia Federal Tipo B)"
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => docsInputRef.current?.click()}
              disabled={isUploadingDocs}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#2D2926] hover:bg-black transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingDocs ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A887]" />
                  Subiendo PDF...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#00A887]" />
                  Subir Documento (PDF)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de documentos pre-cargados */}
        {docsPrecargados.length > 0 ? (
          <div className="space-y-2.5">
            {docsPrecargados.map((doc) => {
              const isNewlyUploaded = newlyUploadedDocIds.includes(doc.id);

              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isNewlyUploaded
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isNewlyUploaded
                          ? 'bg-[#00A887] text-white'
                          : 'bg-[#691C32]/10 border border-[#691C32]/20 text-[#691C32]'
                      }`}
                    >
                      {isNewlyUploaded ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <FolderOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#2D2926]">{doc.nombre}</span>
                        {isNewlyUploaded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A887] text-white">
                            RECIÉN SUBIDO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PRE-CARGADO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#636569] break-all">
                        Archivo: <strong className="text-[#2D2926]">{doc.archivo_nombre}</strong> · Subido el{' '}
                        {new Date(doc.fecha_subida).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setViewerConfig({
                          tipo: 'documentos',
                          docId: doc.id,
                          docNombre: doc.nombre,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#691C32] hover:bg-[#521627] transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C2BA98]" />
                      Ver en Línea
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDocItem(doc.id, doc.archivo_nombre)}
                      disabled={downloadingDocId === doc.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#2D2926] bg-white border border-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {downloadingDocId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A887]" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-[#00A887]" />
                      )}
                      Descargar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocItem(doc.id, doc.nombre)}
                      disabled={deletingDocId === doc.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 text-center text-xs text-[#636569]">
            Aún no has pre-cargado documentos adicionales para el empleo. Usa el selector de arriba para subir tu primer PDF.
          </div>
        )}
      </div>

      {/* Modal Visor PDF en línea */}
      {viewerConfig && (
        <CvViewerModal
          isOpen={true}
          onClose={() => setViewerConfig(null)}
          candidatoNombre={`Matrícula ${profile?.matricula || 'UTH'}`}
          matricula={profile?.matricula}
          token={token}
          tipo={viewerConfig.tipo}
          isOwnProfile={true}
          docId={viewerConfig.docId}
          docNombre={viewerConfig.docNombre}
        />
      )}
    </div>
  );
}
