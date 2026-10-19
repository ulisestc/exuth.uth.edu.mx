'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Send,
  XCircle,
  Download,
  Phone,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  Loader2,
  RefreshCw,
  Eye,
  FolderOpen,
} from 'lucide-react';
import {
  Postulacion,
  fetchAdminPostulaciones,
  turnarPostulacionEmpresa,
  rechazarPostulacionUth,
  downloadCvCandidato,
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';
import {
  Card,
  SegmentedTabs,
  SearchInput,
  Button,
  StatusPill,
  Code,
  Tag,
  Alert,
  EmptyState,
  Modal,
  Field,
  Textarea,
  Chip,
} from '@/components/ui';
import { postulacionStatus } from '@/lib/status';

interface PostulacionesFiltroProps {
  token: string;
  onStatsChange?: () => void;
}

type FilterEstado = 'revision_uth' | 'enviada_empresa' | 'Aceptada' | 'rechazada_uth' | 'todas';

const NOTAS_SUGERIDAS_TURNAR = [
  'Candidato validado por Dirección de Vinculación UTH — Perfil afín a la vacante.',
  'Egresado titulado con competencias técnicas y expediente verificado.',
  'Candidato recomendado para entrevista técnica por perfil académico.',
];

const NOTAS_SUGERIDAS_RECHAZAR = [
  'Perfil académico no compatible con el área requerida por la vacante.',
  'Currículum Vitae incompleto o requiere actualización de datos de contacto.',
  'No adjuntó la documentación solicitada por la organización.',
];

export default function PostulacionesFiltro({ token, onStatsChange }: PostulacionesFiltroProps) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('revision_uth');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [viewingCv, setViewingCv] = useState<{
    egresadoId: number;
    candidatoNombre: string;
    matricula?: string;
    tipo: 'cv' | 'documentos';
    docId?: number | null;
    docNombre?: string;
  } | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado]);

  const filteredPostulaciones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return postulaciones;
    return postulaciones.filter(
      (p) =>
        (p.candidato_nombre || '').toLowerCase().includes(q) ||
        (p.candidato_matricula || '').toLowerCase().includes(q) ||
        (p.candidato_carrera || '').toLowerCase().includes(q) ||
        (p.vacante_titulo || '').toLowerCase().includes(q) ||
        (p.vacante_empresa || '').toLowerCase().includes(q)
    );
  }, [postulaciones, searchQuery]);

  const handleDownloadCv = async (postulacion: Postulacion) => {
    setDownloadingId(postulacion.id);
    const nombreArchivo = `CV_${postulacion.candidato_matricula || postulacion.egresado}_${postulacion.candidato_nombre?.replace(/\s+/g, '_')}.pdf`;
    const ok = await downloadCvCandidato(token, postulacion.egresado, nombreArchivo);
    setDownloadingId(null);
    if (!ok) {
      setFeedback({
        type: 'danger',
        message: 'El egresado no cuenta con un archivo PDF de currículum cargado o no se pudo descargar.',
      });
    }
  };

  const openActionModal = (p: Postulacion, tipo: 'turnar' | 'rechazar') => {
    setActionModal({ postulacion: p, tipo });
    setNotasUthInput(
      tipo === 'turnar' ? NOTAS_SUGERIDAS_TURNAR[0] : NOTAS_SUGERIDAS_RECHAZAR[0]
    );
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    const { postulacion, tipo } = actionModal;

    setProcessingId(postulacion.id);
    setFeedback(null);

    const res =
      tipo === 'turnar'
        ? await turnarPostulacionEmpresa(token, postulacion.id, notasUthInput)
        : await rechazarPostulacionUth(token, postulacion.id, notasUthInput);

    setProcessingId(null);
    setActionModal(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message:
          tipo === 'turnar'
            ? `Postulación de ${postulacion.candidato_nombre || 'egresado'} turnada con éxito a la empresa.`
            : 'Postulación descartada en filtro institucional.',
      });
      loadPostulaciones();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'danger',
        message: res.error || 'Ocurrió un error al procesar el dictamen de la postulación.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Buscador */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <SegmentedTabs<FilterEstado>
            items={[
              { id: 'revision_uth', label: 'Por Turnar (Revisión UTH)' },
              { id: 'enviada_empresa', label: 'Turnadas a Empresa' },
              { id: 'Aceptada', label: 'Contratados' },
              { id: 'rechazada_uth', label: 'Descartadas UTH' },
              { id: 'todas', label: 'Todas' },
            ]}
            value={filterEstado}
            onChange={setFilterEstado}
          />

          <div className="flex items-center gap-2.5 w-full xl:w-auto">
            <div className="flex-1 xl:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alumno, matrícula o vacante…"
              />
            </div>
            <Button
              variant="pearl"
              size="sm"
              onClick={loadPostulaciones}
              disabled={loading}
              icon={<RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              <span className="hidden sm:inline">Refrescar</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerta de Feedback */}
      {feedback && (
        <Alert
          tone={feedback.type}
          action={
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-caption font-semibold hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          }
        >
          {feedback.message}
        </Alert>
      )}

      {/* Listado de Postulaciones */}
      {loading ? (
        <Card className="py-16 text-center space-y-3">
          <Loader2 className="size-7 text-brand animate-spin mx-auto" />
          <p className="text-caption text-ink-64">Consultando candidatos y solicitudes registradas…</p>
        </Card>
      ) : filteredPostulaciones.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No hay postulaciones en este estatus"
            description={
              searchQuery
                ? `No se encontraron candidatos que coincidan con "${searchQuery}".`
                : filterEstado === 'revision_uth'
                ? 'No hay candidatos pendientes de filtro institucional por turnar a las empresas.'
                : 'No se encontraron postulaciones registradas en este criterio.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPostulaciones.map((p) => {
            const isProcessing = processingId === p.id;
            const isDownloading = downloadingId === p.id;
            const stInfo = postulacionStatus(p.estado);

            return (
              <Card key={p.id} className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Datos del Candidato */}
                  <div className="space-y-3 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Code>Matrícula: {p.candidato_matricula || 'No asignada'}</Code>
                      <StatusPill status={stInfo} />
                    </div>

                    <h3 className="text-tagline text-ink font-semibold">
                      {p.candidato_nombre || 'Egresado Registrado'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                      <Tag icon={GraduationCap}>
                        {p.candidato_carrera || 'Carrera UTH'} ({p.candidato_nivel_estudios || 'TSU/ING'})
                      </Tag>
                      <Tag icon={Briefcase}>
                        Vacante: {p.vacante_titulo || `#${p.vacante}`}
                      </Tag>
                      <Tag icon={Building2}>
                        {p.vacante_empresa || 'Empresa Empleadora'}
                      </Tag>
                    </div>

                    {/* Contacto Directo */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-caption">
                      {p.candidato_telefono && (
                        <a
                          href={`tel:${p.candidato_telefono}`}
                          className="inline-flex items-center gap-1.5 text-ink-64 hover:text-primary font-medium transition-colors"
                        >
                          <Phone className="size-3.5" />
                          {p.candidato_telefono}
                        </a>
                      )}
                      {p.candidato_email && (
                        <a
                          href={`mailto:${p.candidato_email}`}
                          className="inline-flex items-center gap-1.5 text-ink-64 hover:text-primary font-medium transition-colors"
                        >
                          <Mail className="size-3.5" />
                          {p.candidato_email}
                        </a>
                      )}
                    </div>

                    {/* Habilidades y Observaciones */}
                    {p.candidato_habilidades && (
                      <div className="text-caption text-ink-80 bg-parchment p-3.5 rounded-field">
                        <strong className="text-ink font-semibold">Competencias:</strong> {p.candidato_habilidades}
                      </div>
                    )}

                    {p.notas_uth && (
                      <Alert tone="warning" title="Notas Institucionales de Vinculación">
                        {p.notas_uth}
                      </Alert>
                    )}
                  </div>

                  {/* Acciones de Vinculación */}
                  <div className="flex flex-wrap sm:flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-52">
                    <Button
                      variant="utility"
                      size="sm"
                      fullWidth
                      icon={<Eye className="size-4" />}
                      onClick={() =>
                        setViewingCv({
                          egresadoId: p.egresado,
                          candidatoNombre: p.candidato_nombre || 'Egresado',
                          matricula: p.candidato_matricula,
                          tipo: 'cv',
                        })
                      }
                    >
                      Ver CV en Línea
                    </Button>

                    {/* Documentos Adicionales si existen */}
                    {p.candidato_lista_documentos && p.candidato_lista_documentos.length > 0 &&
                      p.candidato_lista_documentos.map((doc) => (
                        <Button
                          key={doc.id || doc.nombre}
                          variant="pearl"
                          size="sm"
                          fullWidth
                          icon={<FolderOpen className="size-3.5 text-wine shrink-0" />}
                          onClick={() =>
                            setViewingCv({
                              egresadoId: p.egresado,
                              candidatoNombre: p.candidato_nombre || 'Egresado',
                              matricula: p.candidato_matricula,
                              tipo: 'documentos',
                              docId: doc.id,
                              docNombre: doc.nombre,
                            })
                          }
                          title={`Ver documento: ${doc.nombre}`}
                        >
                          <span className="truncate max-w-[140px]">{doc.nombre}</span>
                        </Button>
                      ))}

                    <Button
                      variant="pearl"
                      size="sm"
                      fullWidth
                      loading={isDownloading}
                      icon={<Download className="size-3.5 text-primary" />}
                      onClick={() => handleDownloadCv(p)}
                    >
                      Descargar CV PDF
                    </Button>

                    {p.estado === 'revision_uth' && (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={isProcessing}
                        icon={<Send className="size-3.5" />}
                        onClick={() => openActionModal(p, 'turnar')}
                      >
                        Turnar a Empresa
                      </Button>
                    )}

                    {(p.estado === 'revision_uth' || p.estado === 'enviada_empresa') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        fullWidth
                        disabled={isProcessing}
                        icon={<XCircle className="size-3.5" />}
                        onClick={() => openActionModal(p, 'rechazar')}
                      >
                        Descartar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Dictamen Institucional (Notas UTH) */}
      <Modal
        open={Boolean(actionModal)}
        onClose={() => processingId === null && setActionModal(null)}
        dismissible={processingId === null}
        size="md"
        title={
          actionModal?.tipo === 'turnar'
            ? 'Turnar candidato a la empresa'
            : 'Descartar postulación en filtro UTH'
        }
        description={
          actionModal && (
            <>
              Candidato: <strong className="text-ink">{actionModal.postulacion.candidato_nombre}</strong> · Vacante:{' '}
              <strong className="text-ink">{actionModal.postulacion.vacante_titulo}</strong>
            </>
          )
        }
        footer={
          <>
            <Button
              variant="pearl"
              size="md"
              disabled={processingId !== null}
              onClick={() => setActionModal(null)}
            >
              Cancelar
            </Button>
            <Button
              variant={actionModal?.tipo === 'turnar' ? 'primary' : 'destructive'}
              size="md"
              loading={processingId !== null}
              onClick={confirmAction}
            >
              {actionModal?.tipo === 'turnar' ? 'Confirmar y turnar' : 'Confirmar descarte'}
            </Button>
          </>
        }
      >
        {actionModal && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-fine font-semibold uppercase tracking-wider text-ink-64 block">
                Plantillas rápidas de dictamen:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(actionModal.tipo === 'turnar' ? NOTAS_SUGERIDAS_TURNAR : NOTAS_SUGERIDAS_RECHAZAR).map(
                  (sugerencia, idx) => (
                    <Chip
                      key={idx}
                      selected={notasUthInput === sugerencia}
                      onClick={() => setNotasUthInput(sugerencia)}
                      className="h-auto py-1.5 text-left whitespace-normal"
                    >
                      {sugerencia}
                    </Chip>
                  )
                )}
              </div>
            </div>

            <Field
              label="Observaciones Institucionales UTH"
              optional
              hint={
                actionModal.tipo === 'turnar'
                  ? 'Estas notas serán visibles para la empresa empleadora cuando revise el perfil del egresado.'
                  : 'Estas notas quedarán registradas en el expediente de trazabilidad del egresado.'
              }
            >
              <Textarea
                value={notasUthInput}
                onChange={(e) => setNotasUthInput(e.target.value)}
                rows={3}
                placeholder="Escribe comentarios de pertinencia académica o motivo de descarte…"
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* Modal Visor Interactivo de CV o Documentos */}
      {viewingCv && (
        <CvViewerModal
          egresadoId={viewingCv.egresadoId}
          candidatoNombre={viewingCv.candidatoNombre}
          matricula={viewingCv.matricula}
          tipo={viewingCv.tipo}
          docId={viewingCv.docId}
          docNombre={viewingCv.docNombre}
          token={token}
          onClose={() => setViewingCv(null)}
        />
      )}
    </div>
  );
}
