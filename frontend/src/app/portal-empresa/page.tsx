'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath } from '@/lib/auth';
import {
  fetchMiPerfilEmpresa,
  fetchMisVacantes,
  fetchPostulacionesEmpresa,
  cerrarVacante,
  EmpresaProfile,
  VacanteEmpresaItem,
  Postulacion,
} from '@/lib/api';
import { NuevaVacanteModal } from '@/components/empresas/NuevaVacanteModal';
import { CandidatosManager } from '@/components/empresas/CandidatosManager';
import {
  Building2,
  PlusCircle,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Lock,
  Calendar,
  DollarSign,
  Tag as TagIcon,
  Mail,
  MapPin,
  Edit3,
  Layers,
  Phone,
} from 'lucide-react';
import EditarPerfilEmpresaModal from '@/components/empresas/EditarPerfilEmpresaModal';
import {
  Container,
  Card,
  StatTile,
  Button,
  ButtonLink,
  SubNav,
  useTabParam,
  StatusPill,
  EmptyState,
  PageLoader,
  Code,
  Tag,
  Modal,
  Alert,
} from '@/components/ui';
import {
  getVacanteStatus,
  getModalidadLabel,
  getNivelLabel,
  formatDate,
  formatMXN,
} from '@/lib/status';

type EmpresaTab = 'resumen' | 'vacantes' | 'candidatos' | 'perfil';

export default function PortalEmpresaPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [tab, setTab] = useTabParam<EmpresaTab>(
    ['resumen', 'vacantes', 'candidatos', 'perfil'],
    'resumen'
  );

  const [empresa, setEmpresa] = useState<EmpresaProfile | null>(null);
  const [vacantes, setVacantes] = useState<VacanteEmpresaItem[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const [accionEnProceso, setAccionEnProceso] = useState<number | null>(null);
  const [confirmCloseVacante, setConfirmCloseVacante] = useState<{
    id: number;
    titulo: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Redirigir a login si no está autenticado o a su portal correspondiente
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?tipo=empresa&redirect=/portal-empresa');
      } else if (user && user.rol !== 'empresa' && user.rol !== 'soporte_ti') {
        router.replace(getRoleRedirectPath(user.rol));
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Cargar datos de la empresa, vacantes y postulaciones
  useEffect(() => {
    async function loadData() {
      if (accessToken && user && (user.rol === 'empresa' || user.rol === 'soporte_ti')) {
        try {
          const [perfilData, vacantesData, postulacionesData] = await Promise.all([
            fetchMiPerfilEmpresa(accessToken).catch(() => null),
            fetchMisVacantes(accessToken).catch(() => []),
            fetchPostulacionesEmpresa(accessToken).catch(() => []),
          ]);
          setEmpresa(perfilData);
          setVacantes(vacantesData);
          setPostulaciones(postulacionesData);
        } catch (error) {
          console.error('Error cargando información de la empresa:', error);
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    }

    if (accessToken) {
      loadData();
    }
  }, [accessToken, user]);

  const executeCerrarVacante = async () => {
    if (!confirmCloseVacante || !accessToken) return;
    const { id: vacanteId } = confirmCloseVacante;
    setAccionEnProceso(vacanteId);
    setActionError(null);

    try {
      const res = await cerrarVacante(accessToken, vacanteId);
      if (res.success) {
        setVacantes((prev) =>
          prev.map((v) => (v.id === vacanteId ? { ...v, status: 'cerrada' } : v))
        );
        setConfirmCloseVacante(null);
      } else {
        setActionError(res.error || 'No se pudo cerrar la vacante.');
        setConfirmCloseVacante(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al procesar la solicitud.');
      setConfirmCloseVacante(null);
    } finally {
      setAccionEnProceso(null);
    }
  };

  const handleVacanteCreada = (nuevaVacante: VacanteEmpresaItem) => {
    setVacantes((prev) => [nuevaVacante, ...prev]);
  };

  const handlePostulacionActualizada = (pActualizada: Postulacion) => {
    setPostulaciones((prev) =>
      prev.map((p) => (p.id === pActualizada.id ? pActualizada : p))
    );
  };

  const totalCandidatos = postulaciones.length;
  const vacantesAprobadas = vacantes.filter((v) => v.status === 'aprobada').length;

  if (authLoading || (loadingData && !empresa)) {
    return <PageLoader label="Iniciando portal de empresa…" />;
  }

  if (!user || (user.rol !== 'empresa' && user.rol !== 'soporte_ti')) return null;

  const tabItems = [
    { id: 'resumen' as const, label: 'Resumen', icon: Layers },
    {
      id: 'vacantes' as const,
      label: 'Mis Vacantes',
      icon: Briefcase,
      count: vacantes.length,
    },
    {
      id: 'candidatos' as const,
      label: 'Candidatos',
      icon: Users,
      count: totalCandidatos,
    },
    { id: 'perfil' as const, label: 'Perfil y Convenio', icon: Building2 },
  ];

  return (
    <div className="min-h-[85vh] bg-canvas flex flex-col">
      {/* Sub-Navegación Esmerilada Fija (Apple Sub-nav) */}
      <SubNav
        title="Portal de Empresa"
        items={tabItems}
        value={tab}
        onChange={setTab}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="size-4" />}
            onClick={() => setModalAbierto(true)}
          >
            Publicar Vacante
          </Button>
        }
      />

      <main className="py-8 sm:py-10 flex-1">
        <Container size="console" className="space-y-8">
          {/* Banner Institucional de la Organización */}
          <Card tone="parchment" padded className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Logotipo de la Empresa */}
                <div className="size-20 rounded-card bg-canvas p-2.5 ring-1 ring-hairline flex items-center justify-center overflow-hidden shrink-0">
                  {empresa?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={empresa.logo}
                      alt={empresa.nombre}
                      className="size-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-8 text-ink-48" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {empresa?.status === 'rechazada' ? (
                      <StatusPill tone="danger">Convenio Inactivo</StatusPill>
                    ) : (
                      <StatusPill tone="success">Convenio Activo</StatusPill>
                    )}
                  </div>

                  <h1 className="text-display-md text-ink font-semibold">
                    {empresa?.nombre || `${user.nombres} ${user.apellido_paterno}`}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-64">
                    {empresa?.nombre_contacto && (
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        <Users className="size-4 text-primary" />
                        <span>Contacto: {empresa.nombre_contacto} ({empresa.cargo_contacto || 'RH'})</span>
                      </span>
                    )}
                    {empresa?.giro && (
                      <>
                        <span className="hidden sm:inline text-ink-48">•</span>
                        <span>{empresa.giro}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="pearl"
                  size="sm"
                  icon={<Edit3 className="size-4 text-primary" />}
                  onClick={() => setModalPerfilAbierto(true)}
                >
                  Editar Perfil / Logo
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PlusCircle className="size-4" />}
                  onClick={() => setModalAbierto(true)}
                >
                  Nueva Vacante
                </Button>
              </div>
            </div>

            {!empresa && !loadingData && (
              <div className="mt-4 pt-4 border-t border-divider">
                <Alert tone="info">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span>Tu cuenta empresarial aún no tiene un perfil corporativo completado. Configúralo para que los egresados conozcan tu organización.</span>
                    <Button variant="secondary" size="sm" onClick={() => setModalPerfilAbierto(true)}>
                      Completar Perfil
                    </Button>
                  </div>
                </Alert>
              </div>
            )}
          </Card>

          {/* ── PESTAÑA 1: RESUMEN ───────────────────────────────────── */}
          {tab === 'resumen' && (
            <div className="space-y-8 animate-fade-in">
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatTile
                  label="Vacantes Registradas"
                  value={loadingData ? '…' : vacantes.length}
                  hint="Ofertas de empleo de tu empresa"
                  tone="canvas"
                />

                <StatTile
                  label="Vacantes Aprobadas y Vigentes"
                  value={loadingData ? '…' : vacantesAprobadas}
                  hint="Activas en la bolsa pública UTH"
                  tone="canvas"
                />

                <StatTile
                  label="Candidatos Turnados por UTH"
                  value={loadingData ? '…' : totalCandidatos}
                  hint="Perfiles con filtro de pertinencia"
                  tone="canvas"
                />
              </div>

              {/* Vacantes Recientes */}
              <Card padded className="space-y-6 bg-canvas">
                <div className="flex items-center justify-between pb-3 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Tus Ofertas Laborales Recientes</h2>
                    <p className="text-caption text-ink-64">
                      Supervisa el estatus de aprobación de tus convocatorias.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab('vacantes')}
                    iconRight={<ArrowRight className="size-3.5" />}
                  >
                    Ver todas ({vacantes.length})
                  </Button>
                </div>

                {loadingData ? (
                  <div className="py-8 text-center text-caption text-ink-64">
                    Cargando vacantes…
                  </div>
                ) : vacantes.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No tienes vacantes registradas"
                    description="Publica tu primera convocatoria para recibir perfiles técnicos y de ingeniería validados por la UTH."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setModalAbierto(true)}
                        icon={<PlusCircle className="size-4" />}
                      >
                        Publicar Vacante
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-divider">
                    {vacantes.slice(0, 3).map((v) => {
                      const st = getVacanteStatus(v.status);
                      return (
                        <div key={v.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Code>{v.clave_vacante || `VAC-${v.id}`}</Code>
                              {v.modalidad && (
                                <Tag>{getModalidadLabel(v.modalidad)}</Tag>
                              )}
                              <StatusPill status={st} />
                            </div>
                            <h3 className="text-body-strong text-ink">{v.titulo}</h3>
                            <p className="text-caption text-ink-64">
                              <span>Plazas: {v.num_candidatos}</span>
                              <span className="mx-2">•</span>
                              <span>Registrada el {formatDate(v.fecha_registro)}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <ButtonLink
                              href={`/vacantes/${v.id}`}
                              variant="secondary"
                              size="sm"
                            >
                              Ver en catálogo
                            </ButtonLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── PESTAÑA 2: MIS VACANTES ──────────────────────────────── */}
          {tab === 'vacantes' && (
            <div className="space-y-6 animate-fade-in">
              {actionError && (
                <Alert tone="danger" onDismiss={() => setActionError(null)}>
                  {actionError}
                </Alert>
              )}

              <Card padded className="space-y-6 bg-canvas">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Catálogo de Convocatorias Propias</h2>
                    <p className="text-caption text-ink-64">
                      Gestiona vacantes abiertas, cerradas o en proceso de revisión por la universidad.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusCircle className="size-4" />}
                    onClick={() => setModalAbierto(true)}
                  >
                    Nueva Vacante
                  </Button>
                </div>

                {loadingData ? (
                  <div className="py-12 text-center text-caption text-ink-64">
                    Cargando vacantes…
                  </div>
                ) : vacantes.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Aún no tienes vacantes creadas"
                    description="Registra los requerimientos del puesto para que Vinculación UTH apruebe y publique la convocatoria."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setModalAbierto(true)}
                      >
                        Crear Vacante Ahora
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-divider space-y-4">
                    {vacantes.map((v) => {
                      const st = getVacanteStatus(v.status);
                      return (
                        <div key={v.id} className="pt-4 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Code>{v.clave_vacante || `VAC-${v.id}`}</Code>
                              <StatusPill status={st} />
                              <Tag>{getModalidadLabel(v.modalidad)}</Tag>
                              <Tag>{getNivelLabel(v.nivel_estudios, true)}</Tag>
                            </div>
                            <h3 className="text-body-strong text-ink">{v.titulo}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-64">
                              <span>Plazas: <strong className="text-ink font-semibold">{v.num_candidatos}</strong></span>
                              <span>•</span>
                              <span>
                                Salario:{' '}
                                <strong className="text-ink font-semibold">
                                  {v.salario_a_tratar
                                    ? 'A tratar'
                                    : `${formatMXN(v.sueldo_minimo)} - ${formatMXN(v.sueldo_maximo)}`}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>Fecha: {formatDate(v.fecha_registro)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <ButtonLink
                              href={`/vacantes/${v.id}`}
                              variant="secondary"
                              size="sm"
                            >
                              Ver detalle
                            </ButtonLink>
                            {v.status !== 'cerrada' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                loading={accionEnProceso === v.id}
                                onClick={() => setConfirmCloseVacante({ id: v.id, titulo: v.titulo })}
                              >
                                Cerrar vacante
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── PESTAÑA 3: CANDIDATOS TURNADOS ───────────────────────── */}
          {tab === 'candidatos' && (
            <div className="space-y-6 animate-fade-in">
              <CandidatosManager
                postulaciones={postulaciones}
                vacantes={vacantes}
                token={accessToken || ''}
                onPostulacionActualizada={handlePostulacionActualizada}
              />
            </div>
          )}

          {/* ── PESTAÑA 4: PERFIL Y CONVENIO ─────────────────────────── */}
          {tab === 'perfil' && (
            <div className="space-y-6 animate-fade-in">
              <Card padded className="space-y-6 bg-canvas">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Información Legal y Corporativa</h2>
                    <p className="text-caption text-ink-64">
                      Datos institucionales registrados ante el Departamento de Vinculación UTH.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Edit3 className="size-4" />}
                    onClick={() => setModalPerfilAbierto(true)}
                  >
                    Editar Perfil / Logo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-caption">
                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      <span>Razón Social / Organización</span>
                    </span>
                    <p className="text-body font-semibold text-ink">{empresa?.nombre}</p>
                    <p className="text-ink-64 text-fine">Actividad: {empresa?.actividad_de_la_empresa || 'Industrial'}</p>
                  </div>

                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary" />
                      <span>Contacto Directo de RH</span>
                    </span>
                    <p className="text-body font-semibold text-ink">
                      {empresa?.nombre_contacto || 'Sin contacto registrado'}
                    </p>
                    <p className="text-ink-64 text-fine">{empresa?.cargo_contacto || 'Representante'}</p>
                    {(empresa?.telefono_oficina || empresa?.telefono_celular) && (
                      <p className="text-ink-64 text-fine flex items-center gap-1">
                        <Phone className="size-3" />
                        <span>{empresa.telefono_oficina || empresa.telefono_celular}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>Ubicación y Sector</span>
                    </span>
                    <p className="text-body text-ink leading-relaxed">
                      {empresa?.domicilio || 'No especificado'}
                    </p>
                    <p className="text-ink-64 text-fine">Giro: {empresa?.giro || 'Industria'}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Container>
      </main>

      {/* Modal de Confirmación de Cierre de Vacante */}
      <Modal
        open={Boolean(confirmCloseVacante)}
        onClose={() => !accionEnProceso && setConfirmCloseVacante(null)}
        size="sm"
        eyebrow="Gestión de Convocatoria"
        title="¿Cerrar esta vacante?"
        description={
          confirmCloseVacante
            ? `La vacante "${confirmCloseVacante.titulo}" dejará de recibir nuevas postulaciones de egresados.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmCloseVacante(null)}
              disabled={Boolean(accionEnProceso)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={Boolean(accionEnProceso)}
              onClick={executeCerrarVacante}
            >
              Sí, Cerrar Vacante
            </Button>
          </>
        }
      >
        <p className="text-caption text-ink-64">
          Los candidatos que ya fueron turnados para esta oferta seguirán disponibles en tu bandeja de candidatos.
        </p>
      </Modal>

      {/* Modal de Publicar Vacante */}
      <NuevaVacanteModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        token={accessToken || ''}
        onVacanteCreada={handleVacanteCreada}
      />

      {/* Modal de Edición de Perfil y Logotipo */}
      <EditarPerfilEmpresaModal
        isOpen={modalPerfilAbierto}
        onClose={() => setModalPerfilAbierto(false)}
        empresa={empresa}
        token={accessToken || ''}
        onProfileUpdated={(updated: EmpresaProfile) => setEmpresa(updated)}
      />
    </div>
  );
}
