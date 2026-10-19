'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Download,
  Loader2,
  GraduationCap,
  Phone,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  ShieldAlert,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  PadronEgresadoItem,
  ImportarPadronResponse,
  EgresadoProfile,
  fetchPadronEgresados,
  importarPadronExcel,
  fetchAdminEgresados,
  verificarEgresadoPadron,
  denegarAccesoEgresado,
} from '@/lib/api';
import CvViewerModal from '@/components/shared/CvViewerModal';
import {
  Card,
  StatusPill,
  Code,
  SearchInput,
  Select,
  Button,
  Alert,
  EmptyState,
  StatTile,
  SegmentedTabs,
  Modal,
  Tag,
} from '@/components/ui';
import { getNivelLabel, formatDate } from '@/lib/status';

interface PadronManagerProps {
  token: string;
  onStatsChange?: () => void;
}

const PAGE_SIZE = 10;

type PadronViewMode = 'cuentas' | 'excel';
type CuentasFilter = 'pendientes' | 'verificados' | 'todos';

export default function PadronManager({ token, onStatsChange }: PadronManagerProps) {
  const [viewMode, setViewMode] = useState<PadronViewMode>('cuentas');

  // --- Estado: Cuentas de Egresados en Plataforma (Validación Manual) ---
  const [egresadosList, setEgresadosList] = useState<EgresadoProfile[]>([]);
  const [loadingEgresados, setLoadingEgresados] = useState<boolean>(true);
  const [cuentasFilter, setCuentasFilter] = useState<CuentasFilter>('pendientes');
  const [cuentasSearch, setCuentasSearch] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    tone: 'success' | 'danger' | 'info';
    text: string;
  } | null>(null);
  const [confirmDenyTarget, setConfirmDenyTarget] = useState<EgresadoProfile | null>(null);
  const [cvModalTarget, setCvModalTarget] = useState<EgresadoProfile | null>(null);

  // --- Estado: Padrón Oficial Excel ---
  const [padronList, setPadronList] = useState<PadronEgresadoItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nivelFilter, setNivelFilter] = useState<string>('');
  const [estatusFilter, setEstatusFilter] = useState<string>('');

  // Estados de carga de archivo Excel
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportarPadronResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar cuentas de egresados registradas en la plataforma
  const loadEgresadosPlataforma = async () => {
    setLoadingEgresados(true);
    try {
      const data = await fetchAdminEgresados(token);
      setEgresadosList(data);
    } catch (err) {
      console.error('Error cargando cuentas de egresados:', err);
    } finally {
      setLoadingEgresados(false);
    }
  };

  const loadPadron = async (
    page = currentPage,
    query = searchQuery,
    nivel = nivelFilter,
    estatus = estatusFilter
  ) => {
    setLoading(true);
    try {
      const data = await fetchPadronEgresados(token, {
        page,
        search: query || undefined,
        nivel: nivel || undefined,
        estatus_titulacion: estatus || undefined,
      });
      setPadronList(data.results);
      setTotalCount(data.count);
      setHasNext(Boolean(data.next));
      setHasPrevious(Boolean(data.previous));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error cargando padrón:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEgresadosPlataforma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadPadron(1, searchQuery, nivelFilter, estatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelFilter, estatusFilter]);

  const handleVerificarManual = async (eg: EgresadoProfile, verificado: boolean) => {
    setFeedbackBanner(null);
    setActionLoadingId(eg.id);
    const res = await verificarEgresadoPadron(token, eg.id, verificado);
    setActionLoadingId(null);

    if (res.success) {
      setFeedbackBanner({
        tone: 'success',
        text: verificado
          ? `Se validó manualmente a ${eg.nombre_completo || eg.matricula} (${eg.matricula}) y se incorporó al Padrón Institucional.`
          : `Se revocó el estatus de verificación de padrón para la matrícula ${eg.matricula}.`,
      });
      await loadEgresadosPlataforma();
      await loadPadron(currentPage, searchQuery, nivelFilter, estatusFilter);
      if (onStatsChange) onStatsChange();
    } else {
      setFeedbackBanner({
        tone: 'danger',
        text: res.error || 'No se pudo actualizar el estado de validación.',
      });
    }
  };

  const handleConfirmDenegarAcceso = async () => {
    if (!confirmDenyTarget) return;
    const target = confirmDenyTarget;
    setFeedbackBanner(null);
    setActionLoadingId(target.id);
    const res = await denegarAccesoEgresado(token, target.id);
    setActionLoadingId(null);
    setConfirmDenyTarget(null);

    if (res.success) {
      setFeedbackBanner({
        tone: 'info',
        text: `Acceso denegado: La cuenta de ${target.nombre_completo || target.email || target.matricula} fue desactivada y ya no podrá iniciar sesión en el sistema.`,
      });
      await loadEgresadosPlataforma();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedbackBanner({
        tone: 'danger',
        text: res.error || 'No se pudo desactivar la cuenta del egresado.',
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPadron(1, searchQuery, nivelFilter, estatusFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    loadPadron(newPage, searchQuery, nivelFilter, estatusFilter);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm')) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Formato no válido. Debe ser un archivo Excel (.xlsx).');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm')) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Formato no válido. Debe ser un archivo Excel (.xlsx).');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setImportResult(null);

    const res = await importarPadronExcel(token, selectedFile);
    setIsUploading(false);

    if (res.success && res.data) {
      setImportResult(res.data);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSearchQuery('');
      setNivelFilter('');
      setEstatusFilter('');
      loadPadron(1, '', '', '');
      loadEgresadosPlataforma();
      if (onStatsChange) onStatsChange();
    } else {
      setErrorMessage(res.error || 'Error al procesar el archivo Excel.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalCount);

  const countPendientes = egresadosList.filter((e) => !e.es_verificado_padron).length;
  const countVerificados = egresadosList.filter((e) => e.es_verificado_padron).length;

  const filteredEgresados = egresadosList.filter((e) => {
    if (cuentasFilter === 'pendientes' && e.es_verificado_padron) return false;
    if (cuentasFilter === 'verificados' && !e.es_verificado_padron) return false;
    if (cuentasSearch.trim()) {
      const q = cuentasSearch.toLowerCase();
      const matchNombre = (e.nombre_completo || '').toLowerCase().includes(q);
      const matchEmail = (e.email || '').toLowerCase().includes(q);
      const matchMatricula = (e.matricula || '').toLowerCase().includes(q);
      const matchCurp = (e.curp || '').toLowerCase().includes(q);
      const matchCarrera = (e.carrera || '').toLowerCase().includes(q);
      return matchNombre || matchEmail || matchMatricula || matchCurp || matchCarrera;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Selector superior de modo: Validación Manual de Cuentas vs Sábana Oficial Excel */}
      <Card padded className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-canvas">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-tagline text-ink font-semibold">
              Padrón Escolar y Validación de Egresados
            </h2>
            {countPendientes > 0 && (
              <StatusPill tone="warning">
                {countPendientes} pendiente{countPendientes === 1 ? '' : 's'} de validar
              </StatusPill>
            )}
          </div>
          <p className="text-caption text-ink-64">
            Valida manualmente a egresados registrados fuera del corte o importa la sábana oficial de Servicios Escolares (.xlsx).
          </p>
        </div>

        <SegmentedTabs
          ariaLabel="Modo de gestión de padrón"
          value={viewMode}
          onChange={setViewMode}
          items={[
            {
              id: 'cuentas',
              label: 'Cuentas en Plataforma (Validación Manual)',
              count: countPendientes,
            },
            {
              id: 'excel',
              label: 'Sábana Oficial Excel (.xlsx)',
              count: totalCount,
            },
          ]}
        />
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          MODO 1: CUENTAS DE EGRESADOS EN PLATAFORMA (VALIDACIÓN MANUAL)
         ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'cuentas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Métricas de Cuentas Registradas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile
              tone="canvas"
              label="Pendientes de Validación Manual"
              value={loadingEgresados ? '…' : countPendientes}
              hint="Egresados no hallados en el último Excel"
            />
            <StatTile
              tone="canvas"
              label="Cuentas Verificadas en Padrón"
              value={loadingEgresados ? '…' : countVerificados}
              hint="Aprobadas por Excel o por Vinculación UTH"
            />
            <StatTile
              tone="canvas"
              label="Total Cuentas de Egresados Activas"
              value={loadingEgresados ? '…' : egresadosList.length}
              hint="Egresados con acceso al portal"
            />
          </div>

          {feedbackBanner && (
            <Alert
              tone={feedbackBanner.tone}
              onDismiss={() => setFeedbackBanner(null)}
            >
              {feedbackBanner.text}
            </Alert>
          )}

          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <SegmentedTabs
                ariaLabel="Filtrar cuentas de egresados"
                value={cuentasFilter}
                onChange={setCuentasFilter}
                items={[
                  { id: 'pendientes', label: 'Pendientes de Validar', count: countPendientes },
                  { id: 'verificados', label: 'Verificados en Padrón', count: countVerificados },
                  { id: 'todos', label: 'Todas las Cuentas', count: egresadosList.length },
                ]}
              />

              <div className="flex items-center gap-2.5 w-full xl:w-auto">
                <div className="flex-1 sm:w-80">
                  <SearchInput
                    placeholder="Buscar por nombre, matrícula, correo o CURP…"
                    value={cuentasSearch}
                    onChange={(e) => setCuentasSearch(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="pearl"
                  size="md"
                  onClick={loadEgresadosPlataforma}
                  title="Actualizar listado"
                  icon={<RefreshCw className="size-4" />}
                />
              </div>
            </div>

            {loadingEgresados ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="size-7 text-brand animate-spin mx-auto" />
                <p className="text-caption text-ink-64">
                  Cargando cuentas de egresados registradas en la plataforma…
                </p>
              </div>
            ) : filteredEgresados.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title={
                  cuentasFilter === 'pendientes'
                    ? 'No hay egresados pendientes de validación manual'
                    : 'No se encontraron cuentas de egresados'
                }
                description={
                  cuentasFilter === 'pendientes'
                    ? 'Todas las cuentas de egresados registradas en la plataforma ya han sido verificadas en el Padrón Institucional.'
                    : 'Ajusta el filtro o término de búsqueda para consultar otros registros.'
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-card ring-1 ring-hairline">
                <table className="w-full text-left text-caption">
                  <thead>
                    <tr className="bg-parchment border-b border-hairline text-ink-64 font-semibold uppercase tracking-wider text-fine">
                      <th className="py-3.5 px-4">Matrícula / CURP</th>
                      <th className="py-3.5 px-4">Egresado y Cuenta</th>
                      <th className="py-3.5 px-4">Programa / Nivel</th>
                      <th className="py-3.5 px-4">Contacto y CV</th>
                      <th className="py-3.5 px-4">Estatus Padrón</th>
                      <th className="py-3.5 px-4 text-right">Dictamen Manual UTH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas">
                    {filteredEgresados.map((eg) => {
                      const isProcessing = actionLoadingId === eg.id;
                      return (
                        <tr key={eg.id} className="hover:bg-pearl transition-colors">
                          <td className="py-4 px-4 align-top">
                            <Code>{eg.matricula}</Code>
                            <span className="block font-mono text-fine text-ink-64 mt-1">
                              {eg.curp}
                            </span>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <span className="font-semibold text-ink block">
                              {eg.nombre_completo || `Usuario #${eg.user}`}
                            </span>
                            {eg.email && (
                              <span className="flex items-center gap-1.5 text-fine text-ink-64 mt-0.5">
                                <Mail className="size-3.5 text-ink-48 shrink-0" />
                                <span>{eg.email}</span>
                              </span>
                            )}
                            {eg.fecha_registro && (
                              <span className="block text-fine text-ink-48 mt-0.5">
                                Registrado: {formatDate(eg.fecha_registro)}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 align-top">
                            <span className="font-medium text-ink block">{eg.carrera}</span>
                            <Tag className="mt-1">{getNivelLabel(eg.nivel_estudios)}</Tag>
                          </td>

                          <td className="py-4 px-4 align-top space-y-1.5">
                            {eg.telefono_celular ? (
                              <div className="flex items-center gap-1.5 text-fine text-ink">
                                <Phone className="size-3.5 text-primary shrink-0" />
                                <span>{eg.telefono_celular}</span>
                              </div>
                            ) : (
                              <span className="text-fine text-ink-48 block">Sin teléfono</span>
                            )}
                            {eg.cv ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={<Eye className="size-3.5 text-primary" />}
                                onClick={() => setCvModalTarget(eg)}
                              >
                                Ver CV PDF
                              </Button>
                            ) : (
                              <span className="text-fine text-ink-48 block">CV aún no cargado</span>
                            )}
                          </td>

                          <td className="py-4 px-4 align-top">
                            {eg.es_verificado_padron ? (
                              <StatusPill tone="success">Verificado en Padrón</StatusPill>
                            ) : (
                              <StatusPill tone="warning">En Validación Manual</StatusPill>
                            )}
                          </td>

                          <td className="py-4 px-4 align-top text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-2">
                              {!eg.es_verificado_padron ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    loading={isProcessing}
                                    icon={<UserCheck className="size-3.5" />}
                                    onClick={() => handleVerificarManual(eg, true)}
                                  >
                                    Validar en Padrón
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    disabled={isProcessing}
                                    icon={<UserX className="size-3.5" />}
                                    onClick={() => setConfirmDenyTarget(eg)}
                                  >
                                    Denegar Acceso
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    loading={isProcessing}
                                    icon={<RotateCcw className="size-3.5" />}
                                    onClick={() => handleVerificarManual(eg, false)}
                                  >
                                    Revocar Validación
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isProcessing}
                                    icon={<UserX className="size-3.5" />}
                                    className="text-danger hover:bg-danger-tint"
                                    onClick={() => setConfirmDenyTarget(eg)}
                                  >
                                    Desactivar
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODO 2: SÁBANA OFICIAL EXCEL (SERVICIOS ESCOLARES)
         ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'excel' && (
        <div className="space-y-8 animate-fade-in">
          {/* Zona de Carga Masiva (Excel) */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <StatusPill tone="success" dot={false}>
                  <FileSpreadsheet className="size-3.5" />
                  Sincronización con Servicios Escolares
                </StatusPill>
                <h2 className="text-tagline text-ink font-semibold">
                  Carga Masiva del Padrón de Egresados UTH (.xlsx)
                </h2>
                <p className="text-caption text-ink-64 max-w-2xl leading-relaxed">
                  Importa la sábana oficial de egresados de Servicios Escolares (formato de 78 columnas). El sistema
                  ejecuta un Upsert por matrícula y verifica automáticamente a los alumnos registrados.
                </p>
              </div>

              <a
                href="/plantillas/Plantilla_Padron_Egresados_UTH.xlsx"
                download
                className="press inline-flex items-center gap-2 px-4 py-2 rounded-field text-caption font-semibold text-ink bg-parchment hover:bg-divider ring-1 ring-inset ring-hairline transition-colors shrink-0 self-start"
              >
                <Download className="size-4 text-primary" />
                Descargar Plantilla (.xlsx)
              </a>
            </div>

            {/* Zona Drag & Drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-brand bg-primary-tint/40'
                  : 'border-hairline bg-pearl hover:border-ink-48'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="size-12 rounded-full bg-primary-tint flex items-center justify-center mx-auto text-primary mb-3">
                <UploadCloud className="size-6" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-body font-semibold text-ink">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                  <p className="text-caption text-ink-64">
                    Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB · Haz clic para cambiar de archivo
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-body font-semibold text-ink">
                    Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
                  </p>
                  <p className="text-caption text-ink-64">
                    Formatos permitidos: .xlsx, .xlsm (Tamaño máximo recomendado: 25 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Botón de Importación */}
            {selectedFile && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="pearl"
                  size="md"
                  disabled={isUploading}
                  onClick={() => setSelectedFile(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={isUploading}
                  icon={<UploadCloud className="size-4" />}
                  onClick={handleUploadSubmit}
                >
                  Iniciar Carga y Verificación Masiva
                </Button>
              </div>
            )}

            {/* Alerta de Error */}
            {errorMessage && (
              <Alert tone="danger">
                {errorMessage}
              </Alert>
            )}

            {/* Resumen de Importación Exitosa */}
            {importResult && (
              <div className="p-6 rounded-card bg-parchment space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-body">
                  <CheckCircle2 className="size-5" />
                  {importResult.mensaje}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatTile
                    tone="canvas"
                    label="Total Procesadas"
                    value={importResult.total_filas_procesadas}
                  />
                  <StatTile
                    tone="canvas"
                    label="Nuevos Egresados"
                    value={`+${importResult.creados}`}
                  />
                  <StatTile
                    tone="canvas"
                    label="Actualizados"
                    value={importResult.actualizados}
                  />
                  <StatTile
                    tone="canvas"
                    label="Filas Omitidas"
                    value={importResult.omitidos}
                  />
                </div>

                <p className="text-fine text-ink-64">
                  Se verificaron y sincronizaron automáticamente todas las cuentas de egresados que coinciden con las
                  matrículas del padrón.
                </p>
              </div>
            )}
          </Card>

          {/* Buscador, Filtros y Padrón Institucional Paginado */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-tagline text-ink font-semibold">
                    Consulta del Padrón Oficial UTH
                  </h3>
                  <StatusPill tone="success">
                    {totalCount.toLocaleString('es-MX')} registros
                  </StatusPill>
                </div>
                <p className="text-caption text-ink-64">
                  Registro histórico de matrícula, carrera, periodo y estatus de titulación con navegación paginada.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                <div className="w-full sm:w-48">
                  <Select
                    value={estatusFilter}
                    onChange={(e) => setEstatusFilter(e.target.value)}
                  >
                    <option value="">Todos los estatus</option>
                    <option value="Titulado">Titulado</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Egresado">Egresado</option>
                  </Select>
                </div>

                <div className="flex-1 sm:w-72">
                  <SearchInput
                    placeholder="Matrícula, nombre, carrera o CURP…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" size="md">
                  Buscar
                </Button>

                <Button
                  type="button"
                  variant="pearl"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setNivelFilter('');
                    setEstatusFilter('');
                    loadPadron(1, '', '', '');
                  }}
                  title="Restablecer filtros"
                  icon={<RefreshCw className="size-4" />}
                />
              </form>
            </div>

            {/* Listado de Resultados */}
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="size-7 text-brand animate-spin mx-auto" />
                <p className="text-caption text-ink-64">Consultando registros del padrón institucional…</p>
              </div>
            ) : padronList.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No hay egresados en el padrón"
                description={
                  searchQuery || nivelFilter || estatusFilter
                    ? 'No se encontraron resultados para los criterios de búsqueda seleccionados.'
                    : 'Aún no se ha importado el archivo Excel de Servicios Escolares. Sube tu primer archivo en la sección superior.'
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-card ring-1 ring-hairline">
                  <table className="w-full text-left text-caption">
                    <thead>
                      <tr className="bg-parchment border-b border-hairline text-ink-64 font-semibold uppercase tracking-wider text-fine">
                        <th className="py-3.5 px-4">Matrícula</th>
                        <th className="py-3.5 px-4">Nombre Completo</th>
                        <th className="py-3.5 px-4">Carrera / Nivel</th>
                        <th className="py-3.5 px-4">Periodo / Egreso</th>
                        <th className="py-3.5 px-4">Estatus Titulación</th>
                        <th className="py-3.5 px-4">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline bg-canvas">
                      {padronList.map((item) => (
                        <tr key={item.id} className="hover:bg-pearl transition-colors">
                          <td className="py-3.5 px-4">
                            <Code>{item.matricula}</Code>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-ink">
                            {item.nombre}
                            {item.curp && (
                              <span className="block font-normal text-fine text-ink-64 font-mono mt-0.5">
                                CURP: {item.curp}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-ink block">{item.carrera}</span>
                            <span className="text-fine font-semibold uppercase text-ink-64">
                              {item.nivel || 'TSU / ING'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="block text-ink">{item.periodo || 'N/A'}</span>
                            {item.anio_egreso && (
                              <span className="text-fine font-semibold text-wine">
                                Año {item.anio_egreso}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusPill
                              tone={item.estatus_titulacion === 'Titulado' ? 'success' : 'warning'}
                            >
                              {item.estatus_titulacion || 'En Trámite'}
                            </StatusPill>
                          </td>
                          <td className="py-3.5 px-4 text-ink-64">
                            {(item.correo_personal || item.correo_escolares) && (
                              <div className="flex items-center gap-1.5 text-fine truncate max-w-[200px]">
                                <Mail className="size-3.5 text-ink-48 shrink-0" />
                                <span className="truncate">{item.correo_personal || item.correo_escolares}</span>
                              </div>
                            )}
                            {(item.telefono_movil || item.tel_escolares) && (
                              <div className="flex items-center gap-1.5 text-fine text-ink-64 mt-0.5">
                                <Phone className="size-3.5 text-ink-48 shrink-0" />
                                <span>{item.telefono_movil || item.tel_escolares}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-caption text-ink-64">
                  <div>
                    Mostrando <strong className="text-ink">{startIndex}</strong> a{' '}
                    <strong className="text-ink">{endIndex}</strong> de{' '}
                    <strong className="text-ink">{totalCount.toLocaleString('es-MX')}</strong> egresados en el padrón
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="pearl"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevious || currentPage <= 1 || loading}
                      icon={<ChevronLeft className="size-3.5" />}
                    >
                      Anterior
                    </Button>

                    <span className="px-3.5 py-1.5 rounded-field bg-parchment font-semibold text-caption text-ink">
                      Página {currentPage} de {totalPages}
                    </span>

                    <Button
                      type="button"
                      variant="pearl"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext || currentPage >= totalPages || loading}
                    >
                      Siguiente
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal de Confirmación para Denegar Acceso / Desactivar Cuenta */}
      <Modal
        open={Boolean(confirmDenyTarget)}
        onClose={() => setConfirmDenyTarget(null)}
        size="md"
        eyebrow="Control de Acceso Institucional"
        title="¿Denegar acceso y desactivar cuenta?"
        description="Esta acción bloqueará el inicio de sesión del usuario en la plataforma de Bolsa de Trabajo UTH."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDenyTarget(null)}
              disabled={actionLoadingId !== null}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={actionLoadingId === confirmDenyTarget?.id}
              icon={<UserX className="size-3.5" />}
              onClick={handleConfirmDenegarAcceso}
            >
              Confirmar y Denegar Acceso
            </Button>
          </>
        }
      >
        {confirmDenyTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-card bg-parchment space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-body-strong text-ink">
                  {confirmDenyTarget.nombre_completo || `Usuario #${confirmDenyTarget.user}`}
                </span>
                <Code>{confirmDenyTarget.matricula}</Code>
              </div>
              {confirmDenyTarget.email && (
                <p className="text-caption text-ink-64">{confirmDenyTarget.email}</p>
              )}
              <p className="text-caption text-ink-64">{confirmDenyTarget.carrera}</p>
            </div>
            <Alert tone="warning">
              Si determinas que este registro no corresponde a un egresado de la Universidad Tecnológica de Huejotzingo, su cuenta será desactivada de inmediato.
            </Alert>
          </div>
        )}
      </Modal>

      {/* Visor de CV en línea */}
      {cvModalTarget && (
        <CvViewerModal
          isOpen={Boolean(cvModalTarget)}
          onClose={() => setCvModalTarget(null)}
          token={token}
          egresadoId={cvModalTarget.id}
          candidatoNombre={cvModalTarget.nombre_completo || cvModalTarget.matricula}
          matricula={cvModalTarget.matricula}
          tipo="cv"
        />
      )}
    </div>
  );
}
