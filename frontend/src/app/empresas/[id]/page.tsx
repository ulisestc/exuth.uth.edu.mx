import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchEmpresaById, fetchVacantesPorEmpresa } from '@/lib/api';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  User,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  Container,
  Card,
  StatusPill,
  Tag,
  Code,
  DataList,
  ButtonLink,
  EmptyState,
} from '@/components/ui';
import { formatMXN, getNivelLabel, getModalidadLabel } from '@/lib/status';

interface EmpresaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EmpresaDetailPageProps) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);
  if (isNaN(empresaId)) return { title: 'Empresa no encontrada | UTH' };

  const empresa = await fetchEmpresaById(empresaId);
  if (!empresa) return { title: 'Empresa no encontrada | UTH' };

  return {
    title: `${empresa.nombre} | Directorio de Empresas UTH`,
    description: `Perfil corporativo y vacantes de ${empresa.nombre} en la Bolsa de Trabajo de la Universidad Tecnológica de Huejotzingo.`,
  };
}

export default async function EmpresaDetailPage({ params }: EmpresaDetailPageProps) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);
  if (isNaN(empresaId)) notFound();

  const [empresa, vacantes] = await Promise.all([
    fetchEmpresaById(empresaId),
    fetchVacantesPorEmpresa(empresaId),
  ]);

  if (!empresa) notFound();

  return (
    <div className="py-10 sm:py-14 space-y-8">
      <Container size="console">
        {/* Retorno / Breadcrumb */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link
            href="/empresas"
            className="hover:text-ink flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            <span>Directorio de empresas</span>
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-sm">{empresa.nombre}</span>
        </div>

        {/* Ficha Cabecera Corporativa */}
        <Card className="p-6 sm:p-10 space-y-8 bg-canvas">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="size-16 sm:size-20 rounded-2xl bg-parchment ring-1 ring-inset ring-hairline flex items-center justify-center text-ink font-semibold text-2xl sm:text-3xl shrink-0">
                {empresa.nombre ? empresa.nombre.charAt(0).toUpperCase() : 'E'}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Code>ID #{empresa.id}</Code>
                  <StatusPill tone="success">
                    <CheckCircle2 className="size-3 text-primary" />
                    Empresa Vinculada UTH
                  </StatusPill>
                </div>

                <h1 className="text-display-md text-ink tracking-tight font-semibold">
                  {empresa.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {empresa.sector && <Tag>{empresa.sector}</Tag>}
                  {empresa.giro && <Tag>{empresa.giro}</Tag>}
                  {empresa.campo && <Tag>Campo: {empresa.campo}</Tag>}
                </div>
              </div>
            </div>

            {empresa.correo_contacto && (
              <div className="shrink-0 self-start">
                <ButtonLink
                  href={`mailto:${empresa.correo_contacto}`}
                  variant="primary"
                  size="md"
                >
                  <Mail className="size-4" />
                  Contactar empresa
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Actividad de la empresa */}
          <div className="rounded-card bg-parchment p-5 sm:p-6 space-y-2">
            <h2 className="text-caption font-semibold uppercase tracking-wider text-ink-64">
              Actividad de la organización
            </h2>
            <p className="text-body text-ink leading-relaxed">
              {empresa.actividad_de_la_empresa ||
                'Organización colaboradora comprometida con el desarrollo profesional y la empleabilidad de la comunidad tecnológica de Huejotzingo.'}
            </p>
          </div>

          {/* Datos de contacto y ubicación */}
          <DataList
            columns={3}
            items={[
              ...(empresa.domicilio
                ? [
                    {
                      icon: MapPin,
                      label: 'Ubicación física',
                      value: empresa.domicilio,
                    },
                  ]
                : []),
              {
                icon: User,
                label: 'Enlace de vinculación',
                value: (
                  <div>
                    <p className="font-semibold">{empresa.nombre_contacto || 'Dirección de Recursos Humanos'}</p>
                    <p className="text-caption text-ink-64">{empresa.cargo_contacto || 'Representante'}</p>
                  </div>
                ),
              },
              {
                icon: Phone,
                label: 'Líneas de contacto',
                value: (
                  <div>
                    <p className="font-semibold truncate">
                      {empresa.telefono_oficina || empresa.telefono_celular || empresa.correo_contacto || 'No disponible'}
                    </p>
                    {empresa.correo_contacto && (
                      <p className="text-caption text-ink-64 truncate">{empresa.correo_contacto}</p>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Ofertas laborales vigentes */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h2 className="text-tagline text-ink">
                Ofertas laborales vigentes
              </h2>
              <p className="text-caption text-ink-64 mt-0.5">
                Vacantes autorizadas institucionalmente por la Universidad Tecnológica de Huejotzingo.
              </p>
            </div>

            <StatusPill tone="neutral">
              {vacantes.length} {vacantes.length === 1 ? 'oferta' : 'ofertas'}
            </StatusPill>
          </div>

          {vacantes.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Briefcase}
                title="Sin vacantes activas en este momento"
                description={`Actualmente ${empresa.nombre} no tiene convocatorias laborales vigentes. Explora otras empresas y vacantes en la bolsa universitaria.`}
                action={
                  <ButtonLink href="/vacantes" variant="primary" size="sm">
                    Ver todas las vacantes UTH
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vacantes.map((v) => {
                const sueldoTexto = v.salario_a_tratar
                  ? 'Sueldo a tratar'
                  : v.sueldo_minimo && v.sueldo_maximo
                  ? `${formatMXN(v.sueldo_minimo)} – ${formatMXN(v.sueldo_maximo)} MXN`
                  : v.sueldo_minimo
                  ? `Desde ${formatMXN(v.sueldo_minimo)} MXN`
                  : 'Sueldo a tratar';

                return (
                  <Card
                    key={v.id}
                    interactive
                    className="p-6 flex flex-col justify-between space-y-5 bg-canvas"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Code>{v.clave_vacante || `VAC-${v.id}`}</Code>
                        <StatusPill tone="success">Vigente</StatusPill>
                      </div>

                      <h3 className="text-tagline text-ink font-semibold leading-snug">
                        {v.titulo}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Tag icon={GraduationCap}>
                          {v.area_estudio_nombre || 'Área Tecnológica'} ({getNivelLabel(v.nivel_estudios)})
                        </Tag>
                        <Tag icon={DollarSign}>{sueldoTexto}</Tag>
                        <Tag icon={Clock}>{getModalidadLabel(v.modalidad)}</Tag>
                      </div>

                      <p className="text-caption text-ink-64 line-clamp-2 leading-relaxed">
                        {v.responsabilidades ||
                          v.conocimientos ||
                          'Consulta los requisitos y responsabilidades detalladas de esta vacante institucional.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-hairline flex items-center justify-between">
                      <span className="text-fine text-ink-48">
                        Publicado en Bolsa UTH
                      </span>

                      <ButtonLink
                        href={`/vacantes/${v.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Ver vacante
                        <ArrowRight className="size-3.5" />
                      </ButtonLink>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
