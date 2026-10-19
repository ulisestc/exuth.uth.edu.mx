import React from 'react';
import Link from 'next/link';
import { fetchPublicEmpresas, fetchGiros, fetchSectores } from '@/lib/api';
import {
  Building2,
  ArrowLeft,
  Search,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Container,
  PageHeader,
  Card,
  Button,
  ButtonLink,
  Tag,
  StatusPill,
  EmptyState,
} from '@/components/ui';

interface EmpresasPageProps {
  searchParams: Promise<{
    search?: string;
    giro?: string;
    sector?: string;
  }>;
}

export const metadata = {
  title: 'Directorio de Empresas Vinculadas | Bolsa de Trabajo UTH',
  description:
    'Conoce a las empresas y organizaciones en convenio con la Universidad Tecnológica de Huejotzingo que ofrecen oportunidades de estadías y empleo.',
};

export default async function EmpresasPage({ searchParams }: EmpresasPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const giro = resolvedParams.giro || '';
  const sector = resolvedParams.sector || '';

  const [empresas, giros, sectores] = await Promise.all([
    fetchPublicEmpresas(search, giro, sector).catch(() => []),
    fetchGiros().catch(() => []),
    fetchSectores().catch(() => []),
  ]);

  return (
    <div className="py-10 sm:py-14 space-y-8">
      <Container size="console">
        {/* Migas de pan */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link href="/" className="hover:text-ink flex items-center gap-1.5 transition-colors font-medium">
            <ArrowLeft className="size-3.5" />
            <span>Inicio</span>
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">Empresas Vinculadas</span>
        </div>

        {/* Encabezado */}
        <PageHeader
          eyebrow="Sector Productivo en Alianza"
          title="Directorio de Empresas Vinculadas"
          description="Organizaciones con convenios vigentes para estadías profesionales y contratación de egresados de la Universidad Tecnológica de Huejotzingo."
          actions={
            <div className="rounded-card bg-parchment px-5 py-3 text-center sm:text-right">
              <span className="block text-display-md text-ink font-semibold tabular-nums">
                {empresas.length}
              </span>
              <span className="text-fine text-ink-64 uppercase tracking-wider">
                Empresas aliadas
              </span>
            </div>
          }
        />

        {/* Buscador de Empresas */}
        <Card padded className="mt-8 bg-canvas">
          <form method="GET" action="/empresas" className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="size-4 text-ink-64 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Buscar empresa por nombre o actividad económica…"
                className="w-full h-11 pl-10 pr-4 rounded-field bg-canvas text-caption text-ink ring-1 ring-inset ring-ink/15 outline-none placeholder:text-ink-64/80 focus:ring-2 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              className="press w-full sm:w-auto h-11 px-6 rounded-full bg-primary hover:bg-primary-hover text-white text-caption font-semibold transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>
        </Card>

        {/* Listado de Empresas */}
        <div className="mt-8">
          {empresas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {empresas.map((emp) => (
                <Card
                  key={emp.id}
                  padded
                  className="flex flex-col justify-between hover:ring-ink-48 transition-all bg-canvas"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-14 rounded-card bg-parchment p-2 ring-1 ring-hairline flex items-center justify-center overflow-hidden shrink-0">
                        <Building2 className="size-6 text-ink-48" />
                      </div>

                      <StatusPill tone="success">Convenio UTH</StatusPill>
                    </div>

                    <div>
                      <h3 className="text-body-strong text-ink">{emp.nombre}</h3>
                      {emp.giro && (
                        <p className="text-caption text-ink-64 mt-0.5">{emp.giro}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-caption text-ink-64 pt-2 border-t border-divider">
                      {emp.domicilio && (
                        <p className="flex items-start gap-1.5 line-clamp-2">
                          <MapPin className="size-3.5 text-ink-48 shrink-0 mt-0.5" />
                          <span>{emp.domicilio}</span>
                        </p>
                      )}

                      {emp.nombre_contacto && (
                        <p className="text-fine text-ink-64">
                          Contacto: {emp.nombre_contacto}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-divider flex items-center justify-between">
                    <ButtonLink
                      href={`/empresas/${emp.id}`}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      iconRight={<ArrowRight className="size-3.5" />}
                    >
                      Ver perfil y vacantes
                    </ButtonLink>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padded>
              <EmptyState
                icon={Building2}
                title="No se encontraron organizaciones"
                description="Intenta con otro término de búsqueda o restablece los filtros para ver todas las empresas vinculadas."
                action={
                  <ButtonLink href="/empresas" variant="primary" size="sm">
                    Ver todas las empresas
                  </ButtonLink>
                }
              />
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
