'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  Download,
  Phone,
  Mail,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Award,
  Eye,
} from 'lucide-react';
import {
  Postulacion,
  VacanteEmpresaItem,
  downloadCvCandidato,
  evaluarPostulacion,
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';
import {
  Card,
  Button,
  Alert,
  StatusPill,
  Code,
  Select,
  SearchInput,
  SegmentedTabs,
  Modal,
  EmptyState,
} from '@/components/ui';

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
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'turnados' | 'aceptados' | 'rechazados'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [descargandoCvId, setDescargandoCvId] = useState<number | null>(null);
  const [evaluandoId, setEvaluandoId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Confirmación accesible en lugar de window.confirm
  const [confirmEval, setConfirmEval] = useState<{
    postulacion: Postulacion;
    nuevoEstado: 'Aceptada' | 'Rechazada';
  } | null>(null);

  const [viewingCv, setViewingCv] = useState<{
    egresadoId: number;
    candidatoNombre: string;
    matricula?: string;
    tipo: 'cv' | 'documentos';
    docId?: number | null;
    docNombre?: string;
  } | null>(null);

  const counts = useMemo(() => {
    const base = filtroVacante === 'todas'
      ? postulaciones
      : postulaciones.filter((p) => String(p.vacante) === filtroVacante);
    return {
      todos: base.length,
      turnados: base.filter((p) => p.estado === 'enviada_empresa').length,
      aceptados: base.filter((p) => p.estado === 'Aceptada').length,
      rechazados: base.filter((p) => p.estado === 'Rechazada').length,
    };
  }, [postulaciones, filtroVacante]);

  // Filtrado reactivo de postulaciones
  const postulacionesFiltradas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return postulaciones.filter((p) => {
      if (filtroVacante !== 'todas' && String(p.vacante) !== filtroVacante) {
        return false;
      }
      if (filtroEstado !== 'todos') {
        if (filtroEstado === 'turnados' && p.estado !== 'enviada_empresa') return false;
        if (filtroEstado === 'aceptados' && p.estado !== 'Aceptada') return false;
        if (filtroEstado === 'rechazados' && p.estado !== 'Rechazada') return false;
      }
      if (q) {
        const matchNombre = p.candidato_nombre?.toLowerCase().includes(q);
        const matchCarrera = p.candidato_carrera?.toLowerCase().includes(q);
        const matchMatricula = p.candidato_matricula?.toLowerCase().includes(q);
        const matchVacante = p.vacante_titulo?.toLowerCase().includes(q);
        const matchHabilidades = p.candidato_habilidades?.toLowerCase().includes(q);
        if (!matchNombre && !matchCarrera && !matchMatricula && !matchVacante && !matchHabilidades) {
          return false;
        }
      }
      return true;
    });
  }, [postulaciones, filtroVacante, filtroEstado, searchQuery]);

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

  const executeEvaluar = async () => {
    if (!confirmEval) return;
    const { postulacion: p, nuevoEstado } = confirmEval;

    setErrorMsg(null);
    setSuccessMsg(null);
    setEvaluandoId(p.id);

    try {
      const res = await evaluarPostulacion(token, p.id, nuevoEstado);
      if (res.success) {
        onPostulacionActualizada({ ...p, estado: nuevoEstado });
        setSuccessMsg(
          nuevoEstado === 'Aceptada'
            ? 'Candidato aceptado exitosamente. Se ha generado el registro de colocación institucional.'
            : 'El proceso con el candidato ha sido concluido.'
        );
        setConfirmEval(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo actualizar el estatus del candidato.');
        setConfirmEval(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al evaluar al candidato.');
      setConfirmEval(null);
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
        year: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'enviada_empresa':
        return (
          <StatusPill tone="info" dot>
            Turnado por UTH · Listo para entrevista
          </StatusPill>
        );
      case 'Aceptada':
        return (
          <StatusPill tone="success" dot>
            Aceptado / Contratado · Colocación UTH
          </StatusPill>
        );
      case 'Rechazada':
        return (
          <StatusPill tone="neutral">
            Proceso Concluido
          </StatusPill>
        );
      default:
        return <StatusPill tone="neutral">{estado}</StatusPill>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
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

      {/* Barra de Filtros y Búsqueda */}
      <Card padding="md" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Buscar por nombre del candidato, carrera, matrícula o habilidad..."
            />
          </div>
          <div className="md:col-span-6">
            <Select
              value={filtroVacante}
              onChange={(e) => setFiltroVacante(e.target.value)}
            >
              <option value="todas">Todas mis vacantes ({postulaciones.length} candidatos)</option>
              {vacantes.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.clave_vacante}] {v.titulo}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-divider">
          <SegmentedTabs
            ariaLabel="Filtrar candidatos por estado"
            value={filtroEstado}
            onChange={setFiltroEstado}
            items={[
              { value: 'todos', label: 'Todos', count: counts.todos },
              { value: 'turnados', label: 'Turnados por UTH', count: counts.turnados },
              { value: 'aceptados', label: 'Aceptados', count: counts.aceptados },
              { value: 'rechazados', label: 'Concluidos', count: counts.rechazados },
            ]}
          />
        </div>
      </Card>

      {/* Listado de Candidatos */}
      {postulacionesFiltradas.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={
            postulaciones.length === 0
              ? 'Aún no se han turnado candidatos para tus vacantes'
              : 'No se encontraron candidatos con los filtros seleccionados'
          }
          description={
            postulaciones.length === 0
              ? 'Cuando un egresado aplique y el Departamento de Vinculación UTH valide su perfil académico, su expediente y currículum aparecerán aquí listos para entrevista.'
              : 'Intenta seleccionando otra vacante, limpiando la búsqueda o cambiando el filtro de estatus.'
          }
        />
      ) : (
        <div className="space-y-4">
          {postulacionesFiltradas.map((p) => (
            <Card key={p.id} padding="md" className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-divider pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Code>{p.vacante_clave || `VAC-${p.vacante}`}</Code>
                    <span className="text-caption font-medium text-ink-secondary">
                      Postuló a: <strong className="text-ink">{p.vacante_titulo || 'Vacante'}</strong>
                    </span>
                    {getEstadoBadge(p.estado)}
                  </div>

                  <h3 className="text-card-title text-ink">
                    {p.candidato_nombre || 'Egresado UTH'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-muted">
                    <span className="flex items-center gap-1.5 font-medium text-ink">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      {p.candidato_carrera || 'Carrera Profesional UTH'}
                    </span>
                    {p.candidato_matricula && (
                      <>
                        <span className="hidden sm:inline">·</span>
                        <span className="font-mono text-ink-secondary">
                          Matrícula: {p.candidato_matricula}
                        </span>
                      </>
                    )}
                    <span className="hidden sm:inline">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Postulado el {formatFecha(p.fecha_postulacion)}
                    </span>
                  </div>
                </div>

                {/* Acciones principales con el CV y Documentos */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="wine"
                    size="sm"
                    onClick={() =>
                      setViewingCv({
                        egresadoId: p.egresado,
                        candidatoNombre: p.candidato_nombre || 'Egresado',
                        matricula: p.candidato_matricula,
                        tipo: 'cv',
                      })
                    }
                    leftIcon={<Eye className="w-3.5 h-3.5 text-gold" />}
                  >
                    Ver CV en Línea
                  </Button>

                  {p.candidato_lista_documentos && p.candidato_lista_documentos.length > 0 &&
                    p.candidato_lista_documentos.map((doc) => (
                      <Button
                        key={doc.id || doc.nombre}
                        variant="secondary"
                        size="sm"
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
                        leftIcon={<FileText className="w-3.5 h-3.5 text-wine" />}
                      >
                        <span className="truncate max-w-[150px]">{doc.nombre}</span>
                      </Button>
                    ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadCv(p)}
                    loading={descargandoCvId === p.id}
                    leftIcon={<Download className="w-3.5 h-3.5 text-primary" />}
                  >
                    Descargar CV
                  </Button>
                </div>
              </div>

              {/* Datos de Contacto y Habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contacto */}
                <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-2">
                  <div className="text-micro font-semibold text-ink-muted uppercase tracking-wider">
                    Datos de Contacto Directo
                  </div>
                  <div className="space-y-1.5 text-caption">
                    {p.candidato_telefono ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold text-ink">{p.candidato_telefono}</span>
                        <a
                          href={`https://wa.me/52${p.candidato_telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-micro font-semibold text-success bg-success-bg hover:opacity-85 border border-success-border px-2 py-0.5 rounded-full transition-opacity"
                        >
                          Enviar WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-ink-muted">Teléfono no registrado</span>
                    )}

                    {p.candidato_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-ink-muted" />
                        <a
                          href={`mailto:${p.candidato_email}?subject=Contacto%20Vacante%20${encodeURIComponent(p.vacante_titulo || '')}%20-%20UTH`}
                          className="font-medium text-primary hover:underline"
                        >
                          {p.candidato_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Competencias y Habilidades */}
                <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-2">
                  <div className="text-micro font-semibold text-ink-muted uppercase tracking-wider">
                    Habilidades y Competencias Reportadas
                  </div>
                  <p className="text-caption text-ink-secondary leading-relaxed">
                    {p.candidato_habilidades ||
                      'El egresado no especificó competencias adicionales en su registro inicial.'}
                  </p>
                </div>
              </div>

              {/* Botones de Decisión y Evaluación */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-divider">
                <div className="text-caption text-ink-muted flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  Expediente validado institucionalmente por la Universidad Tecnológica de Huejotzingo.
                </div>

                <div className="flex items-center gap-2">
                  {p.estado === 'enviada_empresa' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmEval({ postulacion: p, nuevoEstado: 'Rechazada' })}
                        disabled={evaluandoId === p.id}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="text-danger hover:bg-danger-bg"
                      >
                        Descartar
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setConfirmEval({ postulacion: p, nuevoEstado: 'Aceptada' })}
                        loading={evaluandoId === p.id}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Aceptar / Contratar Candidato
                      </Button>
                    </>
                  )}

                  {p.estado === 'Aceptada' && (
                    <StatusPill tone="success" icon={<Award className="w-3.5 h-3.5" />}>
                      Colocación Universitaria Registrada
                    </StatusPill>
                  )}

                  {p.estado === 'Rechazada' && (
                    <span className="text-caption text-ink-muted font-medium">
                      Candidato descartado en este proceso.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Confirmación de Evaluación */}
      <Modal
        open={Boolean(confirmEval)}
        onClose={() => !evaluandoId && setConfirmEval(null)}
        size="sm"
        eyebrow={confirmEval?.nuevoEstado === 'Aceptada' ? 'Colocación Institucional UTH' : 'Resolución de Proceso'}
        title={
          confirmEval?.nuevoEstado === 'Aceptada'
            ? '¿Confirmar contratación del egresado?'
            : '¿Descartar candidato del proceso?'
        }
        description={
          confirmEval
            ? `Candidato: ${confirmEval.postulacion.candidato_nombre || 'Egresado UTH'} · Vacante: ${
                confirmEval.postulacion.vacante_titulo || 'Oferta'
              }`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmEval(null)}
              disabled={Boolean(evaluandoId)}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmEval?.nuevoEstado === 'Aceptada' ? 'primary' : 'danger'}
              size="sm"
              loading={Boolean(evaluandoId)}
              onClick={executeEvaluar}
            >
              {confirmEval?.nuevoEstado === 'Aceptada' ? 'Sí, Aceptar y Contratar' : 'Sí, Descartar'}
            </Button>
          </>
        }
      >
        {confirmEval?.nuevoEstado === 'Aceptada' ? (
          <Alert tone="success" title="Registro Oficial de Empleabilidad">
            Esta acción registrará formalmente la Colocación Universitaria del egresado ante el Departamento de Vinculación de la UTH.
          </Alert>
        ) : (
          <p className="text-caption text-ink-secondary">
            El candidato será notificado de que el proceso de selección para esta vacante ha concluido.
          </p>
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
