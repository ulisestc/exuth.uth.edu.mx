'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Loader2,
  FileCheck,
  ShieldCheck,
  Eye,
  Download,
  FolderOpen,
  Plus,
} from 'lucide-react';
import {
  EgresadoProfile,
  uploadMiCv,
  deleteMiCv,
  downloadMiCv,
  uploadMisDocumentos,
  deleteMisDocumentos,
  downloadMisDocumentos,
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';
import {
  Card,
  Button,
  Alert,
  StatusPill,
  Select,
  Input,
  Modal,
  Tag,
} from '@/components/ui';

interface CvManagerProps {
  profile: EgresadoProfile | null;
  token: string;
  onProfileUpdated: (updatedProfile: EgresadoProfile) => void;
  onOpenEditProfile?: () => void;
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

export function CvManager({ profile, token, onProfileUpdated, onOpenEditProfile }: CvManagerProps) {
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

  // Confirmación accesible en lugar de window.confirm
  const [confirmDelete, setConfirmDelete] = useState<
    | { kind: 'cv' }
    | { kind: 'doc'; docId: number; nombreDoc: string }
    | null
  >(null);

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

    if (!profile) {
      setErrorMsg('Primero debes completar tu Ficha Académica (matrícula, CURP y carrera) antes de subir tu CV.');
      return;
    }

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

    if (!profile) {
      setErrorMsg('Primero debes completar tu Ficha Académica (matrícula, CURP y carrera) antes de subir documentos.');
      return;
    }

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

  const executeConfirmDelete = async () => {
    if (!confirmDelete) return;

    if (confirmDelete.kind === 'cv') {
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
          setConfirmDelete(null);
        } else {
          setErrorMsg(result.error || 'No se pudo eliminar el archivo.');
          setConfirmDelete(null);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error de conexión al eliminar el archivo.');
        setConfirmDelete(null);
      } finally {
        setIsDeleting(false);
      }
    } else {
      const { docId, nombreDoc } = confirmDelete;
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
            });
          }
          setSuccessMsg(`Documento "${nombreDoc}" eliminado de tu expediente pre-cargado.`);
          setConfirmDelete(null);
        } else {
          setErrorMsg(result.error || 'No se pudo eliminar el documento.');
          setConfirmDelete(null);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error de conexión al eliminar el documento.');
        setConfirmDelete(null);
      } finally {
        setDeletingDocId(null);
      }
    }
  };

  return (
    <Card id="seccion-cv" padding="lg" className="space-y-6 scroll-mt-6">
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-micro font-semibold text-primary uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Expediente Digital Profesional
          </div>
          <h2 className="text-card-title text-ink">
            Currículum Vitae y Documentos Pre-cargados para el Empleo
          </h2>
          <p className="text-caption text-ink-muted">
            Tu CV es obligatorio. Además, puedes pre-cargar documentos adicionales (Título, Cédula, INE, CURP, Licencias, Certificados) para seleccionarlos con un clic al postularte.
          </p>
        </div>

        {/* Badge de Estatus */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {hasCv ? (
            <StatusPill tone="success" dot>
              CV Activo
            </StatusPill>
          ) : (
            <StatusPill tone="warn" dot>
              CV Pendiente
            </StatusPill>
          )}
          <Tag tone="wine">
            <FolderOpen className="w-3.5 h-3.5 mr-1 inline" />
            {docsPrecargados.length} Doc(s) Pre-cargado(s)
          </Tag>
        </div>
      </div>

      {!profile && (
        <Alert tone="warning" title="Ficha Académica Requerida">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              Para subir tu Currículum Vitae y documentos laborales en PDF, primero necesitas completar tu Ficha Académica (matrícula, CURP y carrera).
            </span>
            {onOpenEditProfile && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onOpenEditProfile}
                className="shrink-0"
              >
                Completar Ficha Académica
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Mensajes de Retroalimentación */}
      {errorMsg && (
        <Alert tone="danger" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert tone="success" onDismiss={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
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
        <div className="p-5 rounded-xl border border-success-border bg-success-bg/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-sm font-semibold text-ink break-all">
                  {getFileDisplayName(profile?.cv, 'Curriculum_UTH.pdf')}
                </span>
                <StatusPill tone="success">CV OFICIAL PRE-CARGADO</StatusPill>
              </div>
              <p className="text-caption text-ink-secondary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                Currículum Vitae protegido y listo para postularse a cualquier vacante.
              </p>
            </div>
          </div>

          {/* Botones de acción para el CV */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="wine"
              size="sm"
              onClick={() => setViewerConfig({ tipo: 'cv', docNombre: 'Currículum Vitae Oficial' })}
              leftIcon={<Eye className="w-3.5 h-3.5 text-gold" />}
            >
              Ver en Línea
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              loading={isDownloading}
              leftIcon={<Download className="w-3.5 h-3.5 text-primary" />}
            >
              Descargar
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reemplazar
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete({ kind: 'cv' })}
              loading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-danger hover:bg-danger-bg"
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        /* Estado: Sin CV -> Dropzone interactivo */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-4 ${
            isDragging
              ? 'border-primary bg-success-bg/40'
              : 'border-hairline hover:border-primary bg-parchment/50 hover:bg-parchment'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-primary text-white' : 'bg-canvas border border-hairline text-primary'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1 max-w-md">
            <p className="text-body-sm font-semibold text-ink">
              {isUploading
                ? 'Subiendo y verificando documento...'
                : 'Arrastra y suelta tu Currículum Vitae (CV) aquí o haz clic para examinar'}
            </p>
            <p className="text-caption text-ink-muted">
              Formato obligatorio: <strong className="text-ink">PDF (.pdf)</strong> · Tamaño máximo:{' '}
              <strong className="text-ink">5 MB</strong>
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isUploading}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            className="pointer-events-none"
          >
            Seleccionar CV en PDF
          </Button>
        </div>
      )}

      {/* 2. Sección: Biblioteca de Documentos Adicionales Pre-cargados */}
      <div className="pt-5 border-t border-divider space-y-4">
        <div>
          <h3 className="text-body font-semibold text-ink flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-wine" />
            Documentos Adicionales Pre-cargados ({docsPrecargados.length})
          </h3>
          <p className="text-caption text-ink-muted mt-0.5">
            Pre-carga aquí tus documentos probatorios en formato PDF (Título, Cédula, INE, CURP, Pasaporte, Visa, Licencia, Certificados). Al postularte a una vacante podrás elegir cuáles adjuntar.
          </p>
        </div>

        {/* Barra para subir un nuevo documento pre-cargado */}
        <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-3">
          <label className="block text-caption font-semibold text-ink">
            Pre-cargar nuevo documento adicional en mi expediente (PDF, máx. 10 MB):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div className="sm:col-span-2 space-y-2">
              <Select
                value={nuevoDocTipo}
                onChange={(e) => setNuevoDocTipo(e.target.value)}
              >
                {TIPOS_DOCUMENTO_CATALOGO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>

              {nuevoDocTipo === 'Otro documento laboral' && (
                <Input
                  type="text"
                  value={nuevoDocPersonalizado}
                  onChange={(e) => setNuevoDocPersonalizado(e.target.value)}
                  placeholder="Nombre del documento (ej. Licencia Federal Tipo B)"
                />
              )}
            </div>

            <Button
              type="button"
              variant="dark"
              size="md"
              onClick={() => docsInputRef.current?.click()}
              loading={isUploadingDocs}
              leftIcon={<Plus className="w-4 h-4 text-brand" />}
              className="w-full"
            >
              Subir Documento (PDF)
            </Button>
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
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isNewlyUploaded
                      ? 'bg-success-bg/50 border-success-border'
                      : 'bg-canvas border-hairline hover:bg-parchment/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isNewlyUploaded
                          ? 'bg-primary text-white'
                          : 'bg-parchment border border-hairline text-wine'
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
                        <span className="text-body-sm font-semibold text-ink">{doc.nombre}</span>
                        {isNewlyUploaded ? (
                          <StatusPill tone="success" dot>
                            RECIÉN SUBIDO
                          </StatusPill>
                        ) : (
                          <StatusPill tone="neutral">PRE-CARGADO</StatusPill>
                        )}
                      </div>
                      <p className="text-caption text-ink-muted break-all">
                        Archivo: <strong className="text-ink">{doc.archivo_nombre}</strong> · Subido el{' '}
                        {new Date(doc.fecha_subida).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="wine"
                      size="sm"
                      onClick={() =>
                        setViewerConfig({
                          tipo: 'documentos',
                          docId: doc.id,
                          docNombre: doc.nombre,
                        })
                      }
                      leftIcon={<Eye className="w-3.5 h-3.5 text-gold" />}
                    >
                      Ver en Línea
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadDocItem(doc.id, doc.archivo_nombre)}
                      loading={downloadingDocId === doc.id}
                      leftIcon={<Download className="w-3.5 h-3.5 text-primary" />}
                    >
                      Descargar
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmDelete({ kind: 'doc', docId: doc.id, nombreDoc: doc.nombre })
                      }
                      loading={deletingDocId === doc.id}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      className="text-danger hover:bg-danger-bg"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-hairline bg-parchment/40 text-center text-caption text-ink-muted">
            Aún no has pre-cargado documentos adicionales para el empleo. Usa el selector de arriba para subir tu primer PDF.
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => !isDeleting && !deletingDocId && setConfirmDelete(null)}
        size="sm"
        eyebrow="Confirmación de Expediente"
        title={
          confirmDelete?.kind === 'cv'
            ? '¿Eliminar Currículum Vitae?'
            : '¿Eliminar documento pre-cargado?'
        }
        description={
          confirmDelete?.kind === 'cv'
            ? 'No podrás postularte a vacantes hasta que subas un nuevo archivo PDF.'
            : confirmDelete?.kind === 'doc'
            ? `Se eliminará "${confirmDelete.nombreDoc}" de tu biblioteca personal.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(null)}
              disabled={isDeleting || Boolean(deletingDocId)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting || Boolean(deletingDocId)}
              onClick={executeConfirmDelete}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Sí, Eliminar
            </Button>
          </>
        }
      >
        <p className="text-caption text-ink-secondary">
          Esta acción removerá el archivo PDF de tu expediente digital en el portal UTH.
        </p>
      </Modal>

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
    </Card>
  );
}
