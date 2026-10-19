'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { EmpresaListItem, fetchAdminEmpresas, cambiarStatusEmpresa } from '@/lib/api';
import {
  Card,
  SegmentedTabs,
  SearchInput,
  Button,
  StatusPill,
  Tag,
  Alert,
  EmptyState,
  Modal,
} from '@/components/ui';
import { empresaStatus } from '@/lib/status';

interface EmpresasValidadorProps {
  token: string;
  onStatsChange?: () => void;
}

type FilterStatus = 'todas' | 'aprobada' | 'rechazada';

export default function EmpresasValidador({ token, onStatsChange }: EmpresasValidadorProps) {
  const [empresas, setEmpresas] = useState<EmpresaListItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    empresa: EmpresaListItem;
    nuevoStatus: 'aprobada' | 'rechazada';
  } | null>(null);

  const loadEmpresas = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchAdminEmpresas(token, filterStatus);
      setEmpresas(data);
    } catch (err) {
      console.error('Error cargando empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredEmpresas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        (e.nombre_contacto || '').toLowerCase().includes(q) ||
        (e.giro || '').toLowerCase().includes(q) ||
        (e.sector || '').toLowerCase().includes(q)
    );
  }, [empresas, searchQuery]);

  const executeStatusChange = async () => {
    if (!confirmModal) return;
    const { empresa, nuevoStatus } = confirmModal;

    setProcessingId(empresa.id);
    setFeedback(null);

    const res = await cambiarStatusEmpresa(token, empresa.id, nuevoStatus);
    setProcessingId(null);
    setConfirmModal(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `El estatus de «${empresa.nombre}» fue actualizado a: ${
          nuevoStatus === 'aprobada' ? 'Activa en Convenio' : 'Suspendida'
        }.`,
      });
      loadEmpresas();
      if (onStatsChange) onStatsChange();
    } else {
      setFeedback({
        type: 'danger',
        message: res.error || 'Ocurrió un error al actualizar el estatus de la empresa.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Normativo UTH */}
      <Alert tone="info" title="Convenio y Autonomía de Registro">
        Las organizaciones registradas cuentan con alta automática en convenio para publicar ofertas laborales. La
        Dirección de Vinculación y Soporte TI auditan periódicamente la información y pueden suspender o reactivar el
        acceso de organizaciones cuando se requiera.
      </Alert>

      {/* Barra de Filtros y Buscador */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SegmentedTabs<FilterStatus>
            items={[
              { id: 'todas', label: 'Todas las Organizaciones' },
              { id: 'aprobada', label: 'Activas en Convenio' },
              { id: 'rechazada', label: 'Suspendidas' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
          />

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="flex-1 lg:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar empresa, contacto o giro…"
              />
            </div>
            <Button
              variant="pearl"
              size="sm"
              onClick={loadEmpresas}
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

      {/* Listado de Empresas */}
      {loading ? (
        <Card className="py-16 text-center space-y-3">
          <Loader2 className="size-7 text-brand animate-spin mx-auto" />
          <p className="text-caption text-ink-64">Consultando padrón de organizaciones vinculadas…</p>
        </Card>
      ) : filteredEmpresas.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No hay empresas en este criterio"
            description={
              searchQuery
                ? `No se encontraron organizaciones que coincidan con "${searchQuery}".`
                : filterStatus === 'rechazada'
                ? 'No hay empresas suspendidas en el sistema.'
                : 'No se encontraron organizaciones registradas en este estatus.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmpresas.map((e) => {
            const isProcessing = processingId === e.id;
            const stInfo = empresaStatus(e.status);

            return (
              <Card key={e.id} className="p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <StatusPill status={stInfo} />
                      <h3 className="text-tagline text-ink font-semibold truncate">
                        {e.nombre}
                      </h3>
                    </div>

                    <div className="size-10 rounded-field bg-parchment ring-1 ring-inset ring-hairline flex items-center justify-center text-ink font-semibold shrink-0">
                      {e.nombre ? e.nombre.charAt(0).toUpperCase() : 'E'}
                    </div>
                  </div>

                  <div className="space-y-2 text-caption text-ink-64">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-primary shrink-0" />
                      <span className="font-medium text-ink">{e.nombre_contacto}</span>
                      {e.cargo_contacto && <span>· {e.cargo_contacto}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-wine shrink-0" />
                      <a href={`mailto:${e.correo_contacto}`} className="hover:underline text-ink-80 truncate">
                        {e.correo_contacto}
                      </a>
                    </div>

                    {(e.telefono_oficina || e.telefono_celular) && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-ink-64 shrink-0" />
                        <span>{e.telefono_oficina || e.telefono_celular}</span>
                      </div>
                    )}

                    {e.domicilio && (
                      <div className="flex items-start gap-2">
                        <MapPin className="size-3.5 text-ink-64 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{e.domicilio}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {e.giro && <Tag>Giro: {e.giro}</Tag>}
                      {e.sector && <Tag>Sector: {e.sector}</Tag>}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-4 border-t border-hairline flex items-center justify-between gap-2">
                  <Link
                    href={`/empresas/${e.id}`}
                    className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:underline"
                  >
                    Ver ficha pública
                    <ExternalLink className="size-3.5" />
                  </Link>

                  {e.status === 'aprobada' ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing}
                      loading={isProcessing}
                      icon={<XCircle className="size-3.5" />}
                      onClick={() => setConfirmModal({ empresa: e, nuevoStatus: 'rechazada' })}
                    >
                      Suspender Convenio
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isProcessing}
                      loading={isProcessing}
                      icon={<CheckCircle2 className="size-3.5" />}
                      onClick={() => setConfirmModal({ empresa: e, nuevoStatus: 'aprobada' })}
                    >
                      Reactivar Convenio
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación */}
      <Modal
        open={Boolean(confirmModal)}
        onClose={() => !processingId && setConfirmModal(null)}
        dismissible={!processingId}
        size="sm"
        title={
          confirmModal?.nuevoStatus === 'aprobada'
            ? 'Reactivar convenio empresarial'
            : 'Suspender convenio empresarial'
        }
        description={
          confirmModal && (
            <>
              Organización: <strong className="text-ink">{confirmModal.empresa.nombre}</strong>
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
              {confirmModal?.nuevoStatus === 'aprobada' ? 'Sí, reactivar convenio' : 'Sí, suspender convenio'}
            </Button>
          </>
        }
      >
        {confirmModal && (
          <p className="text-caption text-ink-64 leading-relaxed">
            {confirmModal.nuevoStatus === 'aprobada'
              ? 'Al reactivar el convenio, esta empresa podrá publicar nuevas vacantes y evaluar perfiles turnados por la universidad.'
              : 'Al suspender temporalmente el convenio, su acceso y la publicación de ofertas laborales quedarán pausados hasta nueva autorización.'}
          </p>
        )}
      </Modal>
    </div>
  );
}
