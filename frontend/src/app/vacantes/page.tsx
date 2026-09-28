import React, { Suspense } from 'react';
import Link from 'next/link';
import { fetchVacantes, fetchAreasEstudio, VacanteFilters } from '@/lib/api';
import { JobCard } from '@/components/vacantes/JobCard';
import { JobFilters } from '@/components/vacantes/JobFilters';
import { Briefcase, ArrowLeft, SearchX, CheckCircle2 } from 'lucide-react';

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
  description: 'Explora ofertas de empleo y estadías profesionales verificadas para egresados de la Universidad Tecnológica de Huejotzingo.',
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
    fetchVacantes(filters),
    fetchAreasEstudio(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Migas de pan / Regresar */}
      <div className="flex items-center gap-2 text-xs text-[#636569]">
        <Link href="/" className="hover:text-[#00A887] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#2D2926]">Catálogo de Vacantes</span>
      </div>

      {/* Encabezado Principal */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00A887]">
            <Briefcase className="w-4 h-4" />
            Bolsa de Trabajo UTH
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2926]">
            Oportunidades Laborales Vigentes
          </h1>
          <p className="text-xs sm:text-sm text-[#636569]">
            Vacantes registradas por empresas aliadas y validadas por el Departamento de Vinculación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-[#00A887]/10 text-[#00A887] text-center border border-[#00A887]/20">
            <span className="block text-xl font-bold">{vacantes.length}</span>
            <span className="text-[10px] uppercase font-semibold">Vacantes disponibles</span>
          </div>
        </div>
      </div>

      {/* Contenido: Filtros laterales + Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Columna de Filtros */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
            <JobFilters areas={areas} />
          </Suspense>
        </div>

        {/* Columna de Resultados */}
        <div className="lg:col-span-3 space-y-4">
          {vacantes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {vacantes.map((vacante) => (
                <JobCard key={vacante.id} vacante={vacante} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-[#A6A6A8]">
                <SearchX className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2D2926]">
                  No se encontraron vacantes con los filtros seleccionados
                </h3>
                <p className="text-xs text-[#636569] max-w-sm mx-auto">
                  Prueba cambiando el término de búsqueda, seleccionando otra área o limpiando los filtros para ver todas las vacantes.
                </p>
              </div>
              <Link
                href="/vacantes"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#00A887] bg-[#00A887]/10 hover:bg-[#00A887]/20 rounded-md transition-colors"
              >
                Restablecer todos los filtros
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
