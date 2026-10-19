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
  uploadMisDocumentos,
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
  FileText,
  UploadCloud,
  FolderOpen,
  Eye,
  Plus,
} from 'lucide-react';
import {
  Button,
  ButtonLink,
  Modal,
  Alert,
  StatusPill,
  Checkbox,
  Select,
  Input,
  Tag,
} from '@/components/ui';

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
      <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-caption font-medium text-ink-64 bg-parchment rounded-full">
        <Loader2 className="size-4 animate-spin text-primary" />
        Verificando estado…
      </div>
    );
  }

  // 1. Caso: Usuario No Autenticado
  if (!isAuthenticated || !user) {
    return (
      <ButtonLink
        href={`/login?redirect=/vacantes/${vacanteId}`}
        variant="primary"
        size="lg"
      >
        <Send className="size-4" />
        Postularme a esta Vacante
      </ButtonLink>
    );
  }

  // 2. Caso: Rol Empresa o Administrador
  if (user.rol !== 'egresado') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-parchment text-caption font-medium text-ink-64">
        <Lock className="size-3.5" />
        Postulación exclusiva para Egresados UTH
      </div>
    );
  }

  // 3. Caso: Egresado Ya Postulado
  if (isApplied) {
    const adjuntos = applicationData?.candidato_lista_documentos || [];
    return (
      <div className="space-y-3">
        {successMsg && (
          <Alert tone="success">
            {successMsg}
          </Alert>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="success">
            Postulado · {getEstadoLabel(applicationData?.estado)}
          </StatusPill>
          <span className="text-fine text-ink-64">
            Expediente: CV Oficial{adjuntos.length > 0 ? ` + ${adjuntos.length} anexo(s)` : ''}
          </span>
        </div>
        <div>
          <Link
            href="/portal-egresado"
            className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:underline"
          >
            Ver estatus en mi portal
            <ArrowRight className="size-3" />
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
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={() => {
          setErrorMsg(null);
          setUploadSuccessMsg(null);
          setShowModal(true);
        }}
      >
        <Send className="size-4" />
        Postularme a esta vacante
      </Button>

      {/* Modal Institucional de Confirmación y Selección de Expediente */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        title="Confirmar postulación y expediente"
        description={
          <>
            Puesto: <strong className="text-ink">{vacanteTitulo}</strong> en{' '}
            <strong className="text-ink">{empresaNombre}</strong>.
          </>
        }
        footer={
          <>
            <Button
              type="button"
              variant="pearl"
              size="md"
              disabled={isSubmitting}
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={isSubmitting || !hasCv}
              onClick={handleApply}
            >
              <Send className="size-4" />
              Confirmar y enviar postulación
            </Button>
          </>
        }
      >
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

        <div className="space-y-6">
          {/* Mensajes de éxito / error */}
          {uploadSuccessMsg && (
            <Alert tone="success">
              {uploadSuccessMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert tone="danger">
              {errorMsg}
            </Alert>
          )}

          {/* Documentos solicitados por la empresa */}
          {documentosRequeridos && (
            <Alert tone="warning" title="Documentación solicitada por la empresa:">
              <p className="mt-0.5">{documentosRequeridos}</p>
            </Alert>
          )}

          {/* 1. CV Pre-cargado (Obligatorio) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-ink">
                1. Currículum Vitae Institucional (Obligatorio)
              </span>
              {hasCv && (
                <StatusPill tone="success">
                  {newlyUploadedCv ? 'Recién subido' : 'Pre-cargado'}
                </StatusPill>
              )}
            </div>

            <div
              className={`p-4 rounded-card ring-1 ring-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                hasCv
                  ? 'bg-primary-tint/40 ring-primary/30'
                  : 'bg-danger-tint ring-danger/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`size-9 rounded-field flex items-center justify-center shrink-0 mt-0.5 ${
                    hasCv ? 'bg-primary text-white' : 'bg-danger text-white'
                  }`}
                >
                  {hasCv ? <CheckCircle2 className="size-5" /> : <FileText className="size-5" />}
                </div>
                <div className="text-caption space-y-0.5 min-w-0">
                  <p className="font-semibold text-ink break-all">
                    {hasCv
                      ? newlyUploadedCv || getFileDisplayName(profile?.cv, `CV_${profile?.matricula}.pdf`)
                      : 'Sin Currículum Vitae cargado'}
                  </p>
                  <p className="text-fine text-ink-64">
                    {hasCv
                      ? 'Archivo PDF listo en tu expediente institucional.'
                      : 'Es obligatorio subir tu CV en formato PDF para poder postularte.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {hasCv && (
                  <Button
                    type="button"
                    variant="pearl"
                    size="sm"
                    onClick={() => setPreviewConfig({ tipo: 'cv', docNombre: 'Currículum Vitae' })}
                  >
                    <Eye className="size-3.5" />
                    Ver PDF
                  </Button>
                )}
                <Button
                  type="button"
                  variant={hasCv ? 'pearl' : 'primary'}
                  size="sm"
                  loading={isUploadingCv}
                  onClick={() => cvInputRef.current?.click()}
                >
                  <UploadCloud className="size-3.5" />
                  {hasCv ? 'Reemplazar' : 'Subir CV (PDF)'}
                </Button>
              </div>
            </div>
          </div>

          {/* 2. Documentos Adicionales */}
          <div className="space-y-3 pt-2 border-t border-hairline">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-ink block">
                  2. Documentos Adicionales ({selectedDocIds.length} seleccionados)
                </span>
                <span className="text-fine text-ink-64">
                  Selecciona los documentos de tu perfil que deseas anexar a esta postulación.
                </span>
              </div>

              {docsPrecargados.length > 0 && (
                <div className="flex items-center gap-2 text-fine">
                  <button
                    type="button"
                    onClick={() => setSelectedDocIds(docsPrecargados.map((d) => d.id))}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-ink-48">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDocIds([])}
                    className="font-medium text-ink-64 hover:underline cursor-pointer"
                  >
                    Desmarcar todos
                  </button>
                </div>
              )}
            </div>

            {/* Lista de documentos existentes */}
            {docsPrecargados.length > 0 ? (
              <div className="space-y-2">
                {docsPrecargados.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  const isNewlyUploaded = newlyUploadedDocIds.includes(doc.id);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`p-3.5 rounded-card ring-1 ring-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-tint/30 ring-primary/40'
                          : 'bg-canvas ring-hairline hover:ring-ink-48'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 size-4 rounded accent-primary cursor-pointer shrink-0"
                        />
                        <div className="text-caption space-y-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink">{doc.nombre}</span>
                            {isNewlyUploaded && (
                              <StatusPill tone="brand">Recién subido</StatusPill>
                            )}
                          </div>
                          <p className="text-fine text-ink-64 break-all">
                            Archivo PDF: <strong className="text-ink">{doc.archivo_nombre}</strong>
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="pearl"
                          size="sm"
                          onClick={() =>
                            setPreviewConfig({
                              tipo: 'documentos',
                              docId: doc.id,
                              docNombre: doc.nombre,
                            })
                          }
                        >
                          <Eye className="size-3.5" />
                          Ver PDF
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-card border-2 border-dashed border-hairline bg-parchment text-center text-caption text-ink-64">
                No tienes documentos adicionales en tu expediente todavía.
              </div>
            )}

            {/* Subir nuevo PDF adicional */}
            <div className="p-4 rounded-card bg-parchment space-y-3">
              <div className="flex items-center gap-2 text-caption font-semibold text-ink">
                <FolderOpen className="size-4 text-wine" />
                <span>Agregar nuevo documento adicional a mi expediente (PDF)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 space-y-2">
                  <Select
                    value={nuevoDocTipo}
                    onChange={(e) => setNuevoDocTipo(e.target.value)}
                  >
                    {TIPOS_DOCUMENTO_SUGERIDOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>

                  {nuevoDocTipo === 'Otro documento requerido por la vacante' && (
                    <Input
                      type="text"
                      value={nuevoDocNombrePersonalizado}
                      onChange={(e) => setNuevoDocNombrePersonalizado(e.target.value)}
                      placeholder="Nombre del documento (ej. Licencia Tipo B)"
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="utility"
                  size="md"
                  loading={isUploadingDocs}
                  onClick={() => docsInputRef.current?.click()}
                  className="h-11"
                >
                  <Plus className="size-4" />
                  Subir PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="p-4 rounded-card bg-parchment text-caption text-ink-64 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-ink">Resumen a enviar: </span>
              <span>
                {hasCv ? '1 CV Oficial' : '0 CV'} + {selectedDocIds.length} anexo(s).
              </span>
            </div>
            <StatusPill tone="warning">
              Estatus inicial: En Revisión por UTH
            </StatusPill>
          </div>
        </div>
      </Modal>

      {/* Visor de PDF */}
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
