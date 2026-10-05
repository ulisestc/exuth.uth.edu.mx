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
  Eye
} from 'lucide-react';
import { EgresadoProfile, uploadMiCv, deleteMiCv, downloadMiCv } from '@/lib/api';

interface CvManagerProps {
  profile: EgresadoProfile | null;
  token: string;
  onProfileUpdated: (updatedProfile: EgresadoProfile) => void;
}

export function CvManager({ profile, token, onProfileUpdated }: CvManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasCv = Boolean(profile?.cv);

  // Extraer nombre legible del archivo o asignar predeterminado
  const getCvDisplayName = () => {
    if (!profile?.cv) return '';
    try {
      const parts = profile.cv.split('/');
      const rawName = parts[parts.length - 1];
      return decodeURIComponent(rawName);
    } catch {
      return 'Curriculum_UTH.pdf';
    }
  };

  const handleFileValidationAndUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validación de tipo de archivo (PDF obligatorio)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Solo se admiten documentos en formato PDF (.pdf).');
      return;
    }

    // Validación de tamaño (máximo 5 MB)
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
        setSuccessMsg('¡Currículum Vitae cargado y vinculado exitosamente a tu perfil UTH!');
        setTimeout(() => setSuccessMsg(null), 4000);
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

  const handleDownload = async () => {
    setErrorMsg(null);
    setIsDownloading(true);
    try {
      const filename = `CV_${profile?.matricula || 'Egresado_UTH'}.pdf`;
      const ok = await downloadMiCv(token, filename);
      if (!ok) {
        if (profile?.cv) {
          window.open(profile.cv, '_blank');
        } else {
          setErrorMsg('No se pudo descargar el archivo.');
        }
      }
    } catch {
      setErrorMsg('Error al descargar el archivo curricular.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Confirmas que deseas eliminar tu Currículum Vitae del sistema? Las empresas a las que te postules no podrán consultarlo hasta que subas uno nuevo.')) {
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
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(result.error || 'No se pudo eliminar el archivo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al eliminar el archivo.');
    } finally {
      setIsDeleting(false);
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
            Gestión de Currículum Vitae (CV)
          </h2>
          <p className="text-xs text-[#636569]">
            Tu CV es el documento oficial que el Departamento de Vinculación y las empresas empleadoras revisan al postularte.
          </p>
        </div>

        {/* Badge de Estatus */}
        <div className="shrink-0">
          {hasCv ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
              CV Activo y Vinculado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              CV Pendiente de Carga
            </span>
          )}
        </div>
      </div>

      {/* Mensajes de Alerta */}
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

      {/* Input oculto para selección de archivo */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* Estado: CV Ya Cargado */}
      {hasCv ? (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2D2926] break-all">
                    {getCvDisplayName()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800 tracking-wide">
                    PDF
                  </span>
                </div>
                <p className="text-xs text-[#636569] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A887]" />
                  Documento protegido y respaldado en el servidor institucional UTH.
                </p>
              </div>
            </div>

            {/* Botones de acción para el CV */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-[#2D2926] bg-white border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A887]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-[#00A887]" />
                )}
                Visualizar / Descargar
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Reemplazar Archivo
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

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#636569] space-y-1">
            <p className="font-bold text-[#2D2926]">💡 Recomendación UTH para tu CV:</p>
            <p>
              Mantén tu experiencia laboral, proyectos integradores y tecnologías clave actualizadas. Cada vez que subas una nueva versión, se sustituirá automáticamente en tus futuras postulaciones.
            </p>
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
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
              isDragging 
                ? 'border-[#00A887] bg-emerald-50/70 scale-[1.01]' 
                : 'border-zinc-300 hover:border-[#00A887] bg-zinc-50/50 hover:bg-emerald-50/20'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-[#00A887] text-white' : 'bg-emerald-50 text-[#00A887]'
            }`}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1 max-w-md">
              <p className="text-sm font-bold text-[#2D2926]">
                {isUploading 
                  ? 'Subiendo y verificando documento...' 
                  : 'Arrastra y suelta tu CV aquí o haz clic para examinar'}
              </p>
              <p className="text-xs text-[#636569]">
                Formato obligatorio: <strong className="text-[#2D2926]">PDF (.pdf)</strong> · Tamaño máximo: <strong className="text-[#2D2926]">5 MB</strong>
              </p>
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm disabled:opacity-50 cursor-pointer pointer-events-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Seleccionar archivo PDF
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#636569]">
            <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
              <span>
                <strong>Postulación en 1 clic:</strong> Al tener tu CV cargado, podrás aplicar instantáneamente a vacantes.
              </span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <ShieldCheck className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
              <span>
                <strong>Confidencialidad:</strong> Solo las empresas cuyas vacantes solicites tendrán acceso a tu CV.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
