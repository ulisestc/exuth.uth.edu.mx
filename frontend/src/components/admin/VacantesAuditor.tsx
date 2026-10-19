'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  HeartHandshake,
} from 'lucide-react';
import { Vacante, fetchAdminVacantes, cambiarStatusVacante } from '@/lib/api';
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
} from '@/components/ui';
import { vacanteStatus, formatMXN } from '@/lib/status';

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

type FilterStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'todas';

export default function VacantesAuditor({ token, onStatsChange }: VacantesAuditorProps) {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pendiente');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Modal de confirmación para Aprobar / Rechazar
  const [confirmModal, setConfirmModal] = useState<{
    vacante: Vacante;
    nuevoStatus: 'aprobada' | 'rechazada';
  } | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredVacantes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vacantes;
    return vacantes.filter(
      (v) =>
        v.titulo.toLowerCase().includes(q) ||
        (v.empresa_nombre || '').toLowerCase().includes(q) ||
        (v.clave_vacante || '').toLowerCase().includes(q) ||
        (v.area_estudio_nombre || '').toLowerCase().includes(q)
    );
  }, [vacantes, searchQuery]);

  const executeStatusChange = async () => {
    if (!confirmModal) return;
    const { vacante, nuevoStatus } = confirmModal;

    setProcessingId(vacante.id);
    setFeedback(null);

    const res = await cambiarStatusVacante(token, vacante.id, nuevoStatus);
    setProcessingId(null);
    setConfirmModal(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `La vacante «${vacante.titulo}» (#${vacante.id}) fue ${
          nuevoStatus === 'aprobada' ? 'aprobada y publicada en la bolsa institucional' : 'rechazada'
        }.`,
      });
      loadVacantes();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'danger',
        message: res.error || 'Ocurrió un error al actualizar la vacante.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Buscador */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SegmentedTabs<FilterStatus>
            items={[
              { id: 'pendiente', label: 'Pendientes por Revisar' },
              { id: 'aprobada', label: 'Aprobadas' },
              { id: 'rechazada', label: 'Rechazadas' },
              { id: 'todas', label: 'Todas' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
          />

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="flex-1 lg:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por puesto, empresa o clave…"
              />
            </div>
            <Button
              variant="pearl"
              size="sm"
              onClick={loadVacantes}
              disabled={loading}
              icon={<RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              <span className="hidden sm:inline">Refrescar</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerta de feedback */}
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

      {/* Listado de Vacantes */}
      {loading ? (
        <Card className="py-16 text-center space-y-3">
          <Loader2 className="size-7 text-brand animate-spin mx-auto" />
          <p className="text-caption text-ink-64">Cargando vacantes desde la base de datos institucional…</p>
        </Card>
      ) : filteredVacantes.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No hay ofertas en este criterio"
            description={
              searchQuery
                ? `No se encontraron vacantes que coincidan con "${searchQuery}".`
                : filterStatus === 'pendiente'
                ? 'No hay vacantes pendientes de revisión en este momento. Todas las solicitudes han sido auditadas.'
                : 'No se encontraron vacantes registradas para el filtro seleccionado.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVacantes.map((v) => {
            const isExpanded = expandedId === v.id;
            const isProcessing = processingId === v.id;
            const stInfo = vacanteStatus(v.status);

            const sueldoTexto = v.salario_a_tratar
              ? 'Sueldo a tratar'
              : v.sueldo_minimo && v.sueldo_maximo
              ? `${formatMXN(v.sueldo_minimo)} – ${formatMXN(v.sueldo_maximo)} MXN`
              : 'No especificado';

            return (
              <Card key={v.id} padded={false} className="overflow-hidden">
                {/* Header de la tarjeta */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Code>{v.clave_vacante || `UTH-VAC-${v.id}`}</Code>
                      <StatusPill status={stInfo} />
                      {v.es_inclusiva && (
                        <StatusPill tone="brand" dot={false}>
                          <HeartHandshake className="size-3.5" />
                          Vacante Inclusiva
                        </StatusPill>
                      )}
                    </div>

                    <h3 className="text-tagline text-ink font-semibold leading-snug">
                      {v.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <Tag icon={Building2}>
                        {v.empresa_nombre || `Empresa ID: ${v.empresa}`}
                      </Tag>
                      <Tag icon={MapPin}>
                        {MODALIDAD_LABELS[v.modalidad] || v.modalidad}
                      </Tag>
                      <Tag icon={DollarSign}>{sueldoTexto}</Tag>
                      <Tag icon={Users}>
                        {v.num_candidatos} {v.num_candidatos === 1 ? 'plaza' : 'plazas'}
                      </Tag>
                      <span className="inline-flex items-center gap-1 text-fine text-ink-64 pl-1">
                        <Calendar className="size-3.5" />
                        {new Date(v.fecha_registro).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="pearl"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                      icon={isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    >
                      {isExpanded ? 'Ocultar Ficha' : 'Ver Ficha Completa'}
                    </Button>

                    {v.status !== 'aprobada' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isProcessing}
                        loading={isProcessing}
                        icon={<CheckCircle2 className="size-4" />}
                        onClick={() => setConfirmModal({ vacante: v, nuevoStatus: 'aprobada' })}
                      >
                        Aprobar
                      </Button>
                    )}

                    {v.status !== 'rechazada' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isProcessing}
                        loading={isProcessing}
                        icon={<XCircle className="size-4" />}
                        onClick={() => setConfirmModal({ vacante: v, nuevoStatus: 'rechazada' })}
                      >
                        Rechazar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Ficha Técnica Completa Desplegable */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-5 border-t border-hairline bg-parchment space-y-4">
                    {/* Bloque 1: Datos de la Organización Empleadora */}
                    <Card className="p-5 space-y-4 bg-canvas">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                        <h4 className="text-caption font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Building2 className="size-4" />
                          1. Organización Empleadora y Contacto Institucional
                        </h4>
                        <Link
                          href={`/empresas/${v.empresa}`}
                          className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:underline"
                        >
                          Ver Perfil de Empresa
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-caption">
                        <div>
                          <span className="text-fine text-ink-64 block">Razón Social / Nombre</span>
                          <span className="font-semibold text-ink">{v.empresa_nombre || 'No especificado'}</span>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Giro / Sector</span>
                          <span className="font-medium text-ink">
                            {v.empresa_giro || 'N/A'} · {v.empresa_sector || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Actividad Económica</span>
                          <span className="text-ink">{v.empresa_actividad || 'No especificada'}</span>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Responsable de la Vacante</span>
                          <span className="font-semibold text-ink">{v.persona_contacto}</span>
                          {v.entrevistador && (
                            <span className="block text-fine text-ink-64">Entrevistador: {v.entrevistador}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Correo Electrónico</span>
                          {v.empresa_correo ? (
                            <a
                              href={`mailto:${v.empresa_correo}`}
                              className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                            >
                              <Mail className="size-3.5" />
                              {v.empresa_correo}
                            </a>
                          ) : (
                            <span className="text-ink-64">No especificado</span>
                          )}
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Teléfonos de Contacto</span>
                          <span className="inline-flex items-center gap-1 text-ink">
                            <Phone className="size-3.5 text-ink-64" />
                            {[
                              v.empresa_telefono && `Oficina: ${v.empresa_telefono}`,
                              v.empresa_celular && `Cel: ${v.empresa_celular}`,
                            ]
                              .filter(Boolean)
                              .join(' | ') || 'No especificado'}
                          </span>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <span className="text-fine text-ink-64 block">Domicilio Corporativo</span>
                          <span className="text-ink">{v.empresa_domicilio || 'No especificado'}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Bloque 2 y 3: Perfil Académico/Demográfico y Condiciones Laborales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Perfil Académico y Requisitos Demográficos */}
                      <Card className="p-5 space-y-3 bg-canvas text-caption">
                        <h4 className="font-semibold uppercase tracking-wider text-wine border-b border-hairline pb-2.5">
                          2. Perfil Académico y Requisitos del Candidato
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-fine text-ink-64 block">Área de Estudio</span>
                            <span className="font-semibold text-ink">
                              {v.area_estudio_nombre || `Área #${v.area_estudio}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Nivel Académico</span>
                            <span className="font-semibold text-ink">
                              {NIVEL_LABELS[v.nivel_estudios] || v.nivel_estudios}
                            </span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Número de Plazas</span>
                            <span className="font-semibold text-ink">{v.num_candidatos} candidato(s)</span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Rango de Edad</span>
                            <span className="text-ink">{v.edad || 'Indistinto'}</span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Género</span>
                            <span className="capitalize text-ink">{v.genero || 'Indistinto'}</span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Estado Civil</span>
                            <span className="capitalize text-ink">{v.estado_civil || 'Indistinto'}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-hairline">
                          <span className="text-fine text-ink-64 block">Inclusión y Accesibilidad</span>
                          <p className="mt-0.5 text-ink">
                            {v.es_inclusiva
                              ? `Sí es vacante inclusiva (${v.capacidades_especiales || 'Adaptaciones disponibles'})`
                              : 'Estándar (Sin requerimientos especiales especificados)'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-hairline">
                          <span className="text-fine text-ink-64 block mb-1.5">Idiomas Requeridos</span>
                          {v.idiomas && v.idiomas.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {v.idiomas.map((req, idx) => (
                                <Tag key={idx} icon={Globe}>
                                  {req.idioma_nombre || `Idioma #${req.idioma}`} · Nivel {req.nivel} (
                                  {req.obligatorio ? 'Obligatorio' : 'Deseable'})
                                </Tag>
                              ))}
                            </div>
                          ) : (
                            <span className="text-ink-64">Sin requisito de idioma extranjero</span>
                          )}
                        </div>
                      </Card>

                      {/* Condiciones Laborales, Prestaciones y Documentos */}
                      <Card className="p-5 space-y-3 bg-canvas text-caption">
                        <h4 className="font-semibold uppercase tracking-wider text-primary border-b border-hairline pb-2.5">
                          3. Condiciones Laborales y Prestaciones
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-fine text-ink-64 block">Tipo de Contratación</span>
                            <span className="font-semibold text-ink">
                              {CONTRATO_LABELS[v.tipo_contratacion] || v.tipo_contratacion}
                            </span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Modalidad</span>
                            <span className="font-semibold text-ink">
                              {MODALIDAD_LABELS[v.modalidad] || v.modalidad}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-fine text-ink-64 block">Horario de Trabajo</span>
                            <span className="text-ink">{v.horario_trabajo || 'No especificado'}</span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Transporte de Personal</span>
                            <span className={v.incluye_transporte ? 'font-semibold text-primary' : 'text-ink-64'}>
                              {v.incluye_transporte ? 'Sí incluye transporte' : 'No incluye transporte'}
                            </span>
                          </div>
                          <div>
                            <span className="text-fine text-ink-64 block">Servicio de Comedor</span>
                            <span className={v.incluye_comedor ? 'font-semibold text-primary' : 'text-ink-64'}>
                              {v.incluye_comedor ? 'Sí incluye comedor' : 'No incluye comedor'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-hairline">
                          <span className="text-fine text-ink-64 block">Prestaciones Ofrecidas</span>
                          <p className="mt-0.5 text-ink">{v.prestaciones || 'Prestaciones de ley'}</p>
                        </div>

                        <div className="pt-3 border-t border-hairline">
                          <span className="text-fine text-ink-64 flex items-center gap-1">
                            <FileText className="size-3.5 text-wine" />
                            Documentos Requeridos para el Empleo
                          </span>
                          <p className="mt-0.5 font-medium text-ink">
                            {v.documentos_requeridos || 'Currículum Vitae'}
                          </p>
                        </div>

                        {v.observaciones && (
                          <div className="pt-3 border-t border-hairline">
                            <span className="text-fine text-ink-64 block">Observaciones Adicionales</span>
                            <p className="mt-0.5 text-ink">{v.observaciones}</p>
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Bloque 4: Competencias Técnicas, Experiencia y Responsabilidades */}
                    <Card className="p-5 space-y-3 bg-canvas text-caption">
                      <h4 className="font-semibold uppercase tracking-wider text-ink border-b border-hairline pb-2.5">
                        4. Experiencia, Competencias y Responsabilidades del Puesto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-ink">
                        <div>
                          <span className="text-fine text-ink-64 block">Experiencia Requerida</span>
                          <p className="mt-0.5">{v.experiencia || 'No especificada'}</p>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Responsabilidades y Actividades</span>
                          <p className="mt-0.5">{v.responsabilidades || 'No especificadas'}</p>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Conocimientos Técnicos</span>
                          <p className="mt-0.5">{v.conocimientos || 'No especificados'}</p>
                        </div>
                        <div>
                          <span className="text-fine text-ink-64 block">Habilidades y Actitudes</span>
                          <p className="mt-0.5">
                            <strong>Habilidades:</strong> {v.habilidades || 'N/A'} <br />
                            <strong>Actitudes:</strong> {v.actitudes || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación Institucional */}
      <Modal
        open={Boolean(confirmModal)}
        onClose={() => !processingId && setConfirmModal(null)}
        size="sm"
        dismissible={!processingId}
        title={
          confirmModal?.nuevoStatus === 'aprobada'
            ? 'Confirmar aprobación de vacante'
            : 'Confirmar rechazo de vacante'
        }
        description={
          confirmModal && (
            <>
              Organización: <strong className="text-ink">{confirmModal.vacante.empresa_nombre}</strong>
            </>
          )
        }
        footer={
          <>
            <Button
              variant="pearl"
              size="md"
              disabled={Boolean(processingId)}
              onClick={() => setConfirmModal(null)}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmModal?.nuevoStatus === 'aprobada' ? 'primary' : 'destructive'}
              size="md"
              loading={Boolean(processingId)}
              onClick={executeStatusChange}
            >
              {confirmModal?.nuevoStatus === 'aprobada' ? 'Sí, aprobar y publicar' : 'Sí, rechazar vacante'}
            </Button>
          </>
        }
      >
        {confirmModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-card bg-parchment space-y-1">
              <div className="flex items-center gap-2">
                <Code>{confirmModal.vacante.clave_vacante || `UTH-VAC-${confirmModal.vacante.id}`}</Code>
              </div>
              <p className="text-body font-semibold text-ink pt-1">
                {confirmModal.vacante.titulo}
              </p>
            </div>

            <p className="text-caption text-ink-64 leading-relaxed">
              {confirmModal.nuevoStatus === 'aprobada'
                ? 'Al aprobar esta convocatoria, será publicada inmediatamente en el catálogo institucional y todos los egresados de carreras afines podrán postularse.'
                : 'Al rechazar esta convocatoria, no será visible en el catálogo público de egresados y la empresa podrá ver el dictamen en su portal.'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
