'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath } from '@/lib/auth';
import {
  fetchMisPostulaciones,
  fetchMiPerfilEgresado,
  Postulacion,
  EgresadoProfile,
} from '@/lib/api';
import { CvManager } from '@/components/egresados/CvManager';
import {
  GraduationCap,
  Briefcase,
  FileText,
  UserCheck,
  ArrowRight,
  Clock,
  Building2,
  ExternalLink,
  Calendar,
  UserCog,
  Phone,
  MapPin,
  Wrench,
  BookOpen,
  Award,
  Layers,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import EditarPerfilEgresadoModal from '@/components/egresados/EditarPerfilEgresadoModal';
import PostulacionTimeline from '@/components/egresados/PostulacionTimeline';
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
  Alert,
  Code,
  Tag,
} from '@/components/ui';
import {
  getPostulacionStatus,
  getNivelLabel,
  getModalidadLabel,
  formatDate,
} from '@/lib/status';

type EgresadoTab = 'resumen' | 'postulaciones' | 'expediente' | 'perfil';

export default function PortalEgresadoPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [tab, setTab] = useTabParam<EgresadoTab>(
    ['resumen', 'postulaciones', 'expediente', 'perfil'],
    'resumen'
  );

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(true);

  const [profile, setProfile] = useState<EgresadoProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [modalEditarPerfil, setModalEditarPerfil] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

  // Redirigir si no está autenticado o tiene rol no autorizado
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?tipo=egresado&redirect=/portal-egresado');
      } else if (user && user.rol !== 'egresado' && user.rol !== 'soporte_ti') {
        router.replace(getRoleRedirectPath(user.rol));
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      if (accessToken && user && (user.rol === 'egresado' || user.rol === 'soporte_ti')) {
        try {
          const [postulacionesData, profileData] = await Promise.all([
            fetchMisPostulaciones(accessToken).catch(() => []),
            fetchMiPerfilEgresado(accessToken).catch(() => null),
          ]);
          setPostulaciones(postulacionesData);
          setProfile(profileData);
        } catch (error) {
          console.error('Error cargando datos del egresado:', error);
        } finally {
          setLoadingPostulaciones(false);
          setLoadingProfile(false);
        }
      } else {
        setLoadingPostulaciones(false);
        setLoadingProfile(false);
      }
    }

    if (accessToken) {
      loadData();
    }
  }, [accessToken, user]);

  if (authLoading || (loadingProfile && !profile)) {
    return <PageLoader label="Iniciando portal de egresado…" />;
  }

  if (!user || (user.rol !== 'egresado' && user.rol !== 'soporte_ti')) return null;

  const postulacionesFiltradas = postulaciones.filter((p) => {
    if (filtroEstado === 'todas') return true;
    return p.estado === filtroEstado;
  });

  const tabItems = [
    { id: 'resumen' as const, label: 'Resumen', icon: Layers },
    {
      id: 'postulaciones' as const,
      label: 'Mis Postulaciones',
      icon: Briefcase,
      count: postulaciones.length,
    },
    { id: 'expediente' as const, label: 'CV y Documentos', icon: FileText },
    { id: 'perfil' as const, label: 'Datos y Contacto', icon: UserCog },
  ];

  return (
    <div className="min-h-[85vh] bg-canvas flex flex-col">
      {/* Sub-Navegación Esmerilada Fija (Apple Sub-nav) */}
      <SubNav
        title="Portal de Egresados"
        items={tabItems}
        value={tab}
        onChange={setTab}
        action={
          <ButtonLink href="/vacantes" variant="primary" size="sm" icon={<Briefcase className="size-4" />}>
            Explorar vacantes
          </ButtonLink>
        }
      />

      <main className="py-8 sm:py-10 flex-1">
        <Container size="console" className="space-y-8">
          {/* Banner de Bienvenida Institucional */}
          <Card tone="parchment" padded className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!profile ? (
                    <StatusPill tone="danger">
                      Ficha Académica Incompleta
                    </StatusPill>
                  ) : profile.es_verificado_padron ? (
                    <StatusPill tone="success">
                      Egresado Verificado en Padrón
                    </StatusPill>
                  ) : (
                    <StatusPill tone="warning">
                      En Validación de Padrón
                    </StatusPill>
                  )}

                  {profile?.matricula && (
                    <Code>Matrícula: {profile.matricula}</Code>
                  )}
                </div>

                <h1 className="text-display-md text-ink font-semibold">
                  Bienvenida(o), {user.nombres} {user.apellido_paterno}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-64">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span>{profile?.carrera || 'Programa Académico por capturar'}</span>
                  </span>
                  <span className="hidden sm:inline text-ink-48">•</span>
                  <span className="flex items-center gap-1.5">
                    <Award className="size-4 text-ink-64 shrink-0" />
                    <span>{getNivelLabel(profile?.nivel_estudios)}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant={profile ? 'pearl' : 'primary'}
                  size="sm"
                  icon={<UserCog className={`size-4 ${profile ? 'text-primary' : ''}`} />}
                  onClick={() => setModalEditarPerfil(true)}
                >
                  {profile ? 'Editar Perfil' : 'Completar Ficha Académica'}
                </Button>
                <ButtonLink
                  href="/vacantes"
                  variant={profile ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<Briefcase className="size-4" />}
                >
                  Ver Vacantes
                </ButtonLink>
              </div>
            </div>
          </Card>

          {/* Retroalimentación institucional sobre el estado en el Padrón */}
          {!profile ? (
            <Alert tone="warning" title="Acción requerida: Completa tu Ficha Académica UTH">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>
                  Tu cuenta de usuario está activa, pero aún no se encuentran registrados tus datos escolares (matrícula, CURP, carrera y teléfono). Complétalos para poder subir tu CV, actualizar tu perfil y postularte a vacantes.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalEditarPerfil(true)}
                  className="shrink-0"
                >
                  Capturar Datos Ahora
                </Button>
              </div>
            </Alert>
          ) : !profile.es_verificado_padron ? (
            <Alert tone="info" title="Cuenta en Validación Manual por Dirección de Vinculación UTH">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>
                  Tu matrícula (<strong>{profile.matricula}</strong>) no se localizó en el último corte automatizado de Servicios Escolares, por lo que tu registro fue turnado a <strong>Dirección de Vinculación UTH</strong> para su validación manual. Mientras tanto, <strong>puedes editar libremente tu perfil, subir tu CV y postularte a vacantes</strong>. Si cometiste algún error al escribir tu matrícula o CURP, puedes corregirlo aquí.
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalEditarPerfil(true)}
                  className="shrink-0"
                >
                  Revisar / Corregir Matrícula
                </Button>
              </div>
            </Alert>
          ) : null}

          {/* ── PESTAÑA 1: RESUMEN ───────────────────────────────────── */}
          {tab === 'resumen' && (
            <div className="space-y-8 animate-fade-in">
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatTile
                  label="Mis Postulaciones Activas"
                  value={loadingPostulaciones ? '…' : postulaciones.length}
                  hint="Aplicaciones turnadas a empresas"
                  tone="canvas"
                />

                <StatTile
                  label="Currículum Vitae (PDF)"
                  value={profile?.cv ? 'Cargado' : 'Pendiente'}
                  hint={profile?.cv ? 'Listo para postularte con 1 clic' : 'Se requiere subir CV en PDF'}
                  tone="canvas"
                />

                <StatTile
                  label="Estatus en Padrón Escolar"
                  value={profile?.es_verificado_padron ? 'Verificado' : 'En trámite'}
                  hint={profile?.curp ? `CURP: ${profile.curp}` : 'Enlace a Servicios Escolares'}
                  tone="canvas"
                />
              </div>

              {/* Últimas Postulaciones */}
              <Card padded className="space-y-6 bg-canvas">
                <div className="flex items-center justify-between pb-3 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Postulaciones Recientes</h2>
                    <p className="text-caption text-ink-64">
                      Monitorea el avance de tus solicitudes de vinculación laboral.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab('postulaciones')}
                    iconRight={<ArrowRight className="size-3.5" />}
                  >
                    Ver todas ({postulaciones.length})
                  </Button>
                </div>

                {loadingPostulaciones ? (
                  <div className="py-8 text-center text-caption text-ink-64">
                    Cargando postulaciones…
                  </div>
                ) : postulaciones.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Aún no tienes postulaciones"
                    description="Explora las oportunidades laborales exclusivas para egresados de la UTH y postúlate."
                    action={
                      <ButtonLink href="/vacantes" variant="primary" size="sm">
                        Explorar Catálogo de Vacantes
                      </ButtonLink>
                    }
                  />
                ) : (
                  <div className="divide-y divide-divider">
                    {postulaciones.slice(0, 3).map((p) => {
                      const st = getPostulacionStatus(p.estado);
                      return (
                        <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Code>{p.vacante_clave || `VAC-${p.vacante}`}</Code>
                              {p.vacante_modalidad && (
                                <Tag>{getModalidadLabel(p.vacante_modalidad)}</Tag>
                              )}
                            </div>
                            <h3 className="text-body-strong text-ink">
                              {p.vacante_titulo || `Vacante #${p.vacante}`}
                            </h3>
                            <p className="text-caption text-ink-64 flex items-center gap-3">
                              <span>{p.vacante_empresa || 'Empresa Vinculada UTH'}</span>
                              <span>•</span>
                              <span>Postulado {formatDate(p.fecha_postulacion)}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <StatusPill status={st} />
                            <ButtonLink
                              href={`/vacantes/${p.vacante}`}
                              variant="secondary"
                              size="sm"
                            >
                              Ver vacante
                            </ButtonLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Guía Rápida del Flujo de Vinculación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card padded className="space-y-2 bg-parchment">
                  <span className="text-fine font-semibold text-primary uppercase tracking-wider block">
                    Fase 1
                  </span>
                  <h3 className="text-body-strong text-ink">Expediente y CV</h3>
                  <p className="text-caption text-ink-64 leading-relaxed">
                    Mantén tu CV en PDF y tus datos actualizados para que las empresas conozcan tu experiencia.
                  </p>
                </Card>

                <Card padded className="space-y-2 bg-parchment">
                  <span className="text-fine font-semibold text-wine uppercase tracking-wider block">
                    Fase 2
                  </span>
                  <h3 className="text-body-strong text-ink">Validación Institucional</h3>
                  <p className="text-caption text-ink-64 leading-relaxed">
                    Vinculación UTH revisa que cumplas el perfil académico antes de turnar tu CV a la empresa.
                  </p>
                </Card>

                <Card padded className="space-y-2 bg-parchment">
                  <span className="text-fine font-semibold text-ink uppercase tracking-wider block">
                    Fase 3
                  </span>
                  <h3 className="text-body-strong text-ink">Entrevista Directa</h3>
                  <p className="text-caption text-ink-64 leading-relaxed">
                    La empresa evalúa tu candidatura y te contacta directamente para agendar las entrevistas.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* ── PESTAÑA 2: MIS POSTULACIONES ─────────────────────────── */}
          {tab === 'postulaciones' && (
            <div className="space-y-6 animate-fade-in">
              <Card padded className="space-y-6 bg-canvas">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Historial de Postulaciones</h2>
                    <p className="text-caption text-ink-64">
                      Trazabilidad institucional de cada una de tus solicitudes laborales.
                    </p>
                  </div>

                  {/* Filtro rápido por estado */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'todas', label: 'Todas' },
                      { id: 'revision_uth', label: 'En revisión UTH' },
                      { id: 'enviada_empresa', label: 'En empresa' },
                      { id: 'Aceptada', label: 'Aceptadas' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFiltroEstado(f.id)}
                        className={`press px-3 py-1 rounded-full text-caption transition-colors ${
                          filtroEstado === f.id
                            ? 'bg-primary text-white font-medium'
                            : 'bg-parchment text-ink-64 hover:text-ink'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingPostulaciones ? (
                  <div className="py-12 text-center text-caption text-ink-64">
                    Cargando postulaciones…
                  </div>
                ) : postulacionesFiltradas.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No hay postulaciones en este filtro"
                    description="Revisa otro estado o explora nuevas vacantes disponibles en la bolsa de trabajo."
                    action={
                      <ButtonLink href="/vacantes" variant="primary" size="sm">
                        Explorar Vacantes
                      </ButtonLink>
                    }
                  />
                ) : (
                  <div className="divide-y divide-divider space-y-6">
                    {postulacionesFiltradas.map((p) => {
                      const st = getPostulacionStatus(p.estado);
                      return (
                        <div key={p.id} className="pt-6 first:pt-0 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <Code>{p.vacante_clave || `VAC-${p.vacante}`}</Code>
                                {p.vacante_modalidad && (
                                  <Tag>{getModalidadLabel(p.vacante_modalidad)}</Tag>
                                )}
                              </div>
                              <h3 className="text-body-strong text-ink">
                                {p.vacante_titulo || `Vacante #${p.vacante}`}
                              </h3>
                              <p className="text-caption text-ink-64 flex items-center gap-2">
                                <Building2 className="size-3.5 text-primary" />
                                <span>{p.vacante_empresa || 'Empresa Vinculada UTH'}</span>
                                <span>•</span>
                                <span>Postulado {formatDate(p.fecha_postulacion)}</span>
                              </p>
                            </div>

                            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                              <StatusPill status={st} />
                              <Link
                                href={`/vacantes/${p.vacante}`}
                                className="text-caption text-primary hover:underline font-medium inline-flex items-center gap-1"
                              >
                                <span>Ver vacante</span>
                                <ExternalLink className="size-3" />
                              </Link>
                            </div>
                          </div>

                          {/* Stepper de Trazabilidad */}
                          <div className="p-4 rounded-field bg-parchment/60 ring-1 ring-hairline">
                            <PostulacionTimeline postulacion={p} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── PESTAÑA 3: CV Y DOCUMENTOS ──────────────────────────── */}
          {tab === 'expediente' && (
            <div className="space-y-6 animate-fade-in">
              <CvManager
                profile={profile}
                token={accessToken || ''}
                onProfileUpdated={(updated) => setProfile(updated)}
                onOpenEditProfile={() => setModalEditarPerfil(true)}
              />
            </div>
          )}

          {/* ── PESTAÑA 4: PERFIL Y DATOS ────────────────────────────── */}
          {tab === 'perfil' && (
            <div className="space-y-6 animate-fade-in">
              <Card padded className="space-y-6 bg-canvas">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-divider">
                  <div>
                    <h2 className="text-tagline text-ink">Datos de Contacto y Perfil</h2>
                    <p className="text-caption text-ink-64">
                      Esta información se comparte con los reclutadores autorizados tras la validación UTH.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<UserCog className="size-4" />}
                    onClick={() => setModalEditarPerfil(true)}
                  >
                    Modificar Datos
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-caption">
                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>Teléfonos</span>
                    </span>
                    <p className="text-body font-semibold text-ink">
                      {profile?.telefono_celular || 'Sin celular registrado'}
                    </p>
                    {profile?.telefono_casa && (
                      <p className="text-ink-64 text-fine">Casa: {profile.telefono_casa}</p>
                    )}
                  </div>

                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>Domicilio</span>
                    </span>
                    <p className="text-body text-ink leading-relaxed">
                      {profile?.domicilio || 'No especificado'}
                    </p>
                  </div>

                  <div className="space-y-2 p-4 rounded-field bg-parchment/50">
                    <span className="text-fine uppercase font-semibold text-ink-64 flex items-center gap-1.5">
                      <Wrench className="size-3.5 text-primary" />
                      <span>Competencias y Habilidades</span>
                    </span>
                    <p className="text-body text-ink leading-relaxed">
                      {profile?.habilidades || 'Sin habilidades registradas'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Container>
      </main>

      {/* Modal de Edición de Perfil */}
      <EditarPerfilEgresadoModal
        isOpen={modalEditarPerfil}
        onClose={() => setModalEditarPerfil(false)}
        profile={profile}
        token={accessToken || ''}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </div>
  );
}
