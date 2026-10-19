import React, { Suspense } from 'react';
import Link from 'next/link';
import { fetchVacantes, fetchAreasEstudio, VacanteFilters } from '@/lib/api';
import { JobCard } from '@/components/vacantes/JobCard';
import { JobFilters } from '@/components/vacantes/JobFilters';
import {
  Container,
  PageHeader,
  EmptyState,
  ButtonLink,
  Card,
  Skeleton,
} from '@/components/ui';
import { ArrowLeft, Briefcase, SearchX } from 'lucide-react';

interface VacantesPageProps {
  searchParams: Promise<{
    search?: string;
    area_estudio?: string;
    nivel_estudios?: string;
    modalidad?: string;
    incluye_transporte?: string;
    ordering?: string;
  }>;
}

export const metadata = {
  title: 'Catálogo de Vacantes | Bolsa de Trabajo UTH',
  description:
    'Explora ofertas de empleo y estadías profesionales verificadas para egresados de la Universidad Tecnológica de Huejotzingo.',
};

export default async function VacantesPage({ searchParams }: VacantesPageProps) {
  const resolvedParams = await searchParams;

  const filters: VacanteFilters = {
    search: resolvedParams.search,
    area_estudio: resolvedParams.area_estudio,
    nivel_estudios: resolvedParams.nivel_estudios,
    modalidad: resolvedParams.modalidad,
    incluye_transporte: resolvedParams.incluye_transporte === 'true',
    ordering: resolvedParams.ordering || '-id',
  };

  const [vacantes, areas] = await Promise.all([
    fetchVacantes(filters).catch(() => []),
    fetchAreasEstudio().catch(() => []),
  ]);

  return (
    <div className="py-10 sm:py-14 space-y-8">
      <Container size="console">
        {/* Migas de pan / Regresar */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link
            href="/"
            className="hover:text-ink flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Inicio</span>
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">Catálogo de Vacantes</span>
        </div>

        {/* Encabezado */}
        <PageHeader
          eyebrow="Bolsa de Trabajo Oficial"
          title="Oportunidades Laborales Vigentes"
          description="Convocatorias verificadas por el Departamento de Vinculación y Extensión Universitaria para egresados UTH."
          actions={
            <div className="rounded-card bg-parchment px-5 py-3 text-center sm:text-right">
              <span className="block text-display-md text-ink font-semibold tabular-nums">
                {vacantes.length}
              </span>
              <span className="text-fine text-ink-64 uppercase tracking-wider">
                Vacantes activas
              </span>
            </div>
          }
        />

        {/* Layout: Filtros laterales + Listado */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Barra de Filtros */}
          <div className="lg:col-span-1">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <JobFilters areas={areas} />
            </Suspense>
          </div>

          {/* Listado de Resultados */}
          <div className="lg:col-span-3 space-y-4">
            {vacantes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {vacantes.map((vacante) => (
                  <JobCard key={vacante.id} vacante={vacante} />
                ))}
              </div>
            ) : (
              <Card padded>
                <EmptyState
                  icon={SearchX}
                  title="No se encontraron vacantes con los criterios seleccionados"
                  description="Prueba cambiando los términos de búsqueda o limpiando los filtros para ver todas las convocatorias vigentes."
                  action={
                    <ButtonLink href="/vacantes" variant="primary" size="sm">
                      Ver todas las vacantes
                    </ButtonLink>
                  }
                />
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
