'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, RotateCcw, Bus, GraduationCap } from 'lucide-react';
import { AreaEstudio } from '@/lib/api';
import { Card, Field, Select, Checkbox, Chip } from '@/components/ui';

interface JobFiltersProps {
  areas: AreaEstudio[];
}

export const JobFilters: React.FC<JobFiltersProps> = ({ areas }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const area = searchParams.get('area_estudio') || '';
  const nivel = searchParams.get('nivel_estudios') || '';
  const modalidad = searchParams.get('modalidad') || '';
  const transporte = searchParams.get('incluye_transporte') === 'true';
  const ordering = searchParams.get('ordering') || '-id';

  const hasActiveFilters = Boolean(search || area || nivel || modalidad || transporte);

  const updateFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '' || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.push(`/vacantes?${params.toString()}`);
  };

  const handleReset = () => {
    router.push('/vacantes');
  };

  return (
    <Card className="space-y-6 bg-canvas" padded>
      {/* Cabecera del filtro */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-2 text-caption font-semibold text-ink">
          <Filter className="size-4 text-primary" />
          <span>Filtrar Vacantes</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="press text-fine text-ink-64 hover:text-danger flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Búsqueda por texto */}
      <Field label="Palabra clave" hint="Presiona Enter para buscar">
        <div className="relative">
          <Search className="size-4 text-ink-64 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            defaultValue={search}
            placeholder="Puesto, empresa o competencia…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilter('search', (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full h-10 pl-10 pr-3.5 rounded-field bg-canvas text-caption text-ink ring-1 ring-inset ring-ink/15 outline-none placeholder:text-ink-64/80 focus:ring-2 focus:ring-brand"
          />
        </div>
      </Field>

      {/* Nivel Académico (Chips en píldora) */}
      <div className="space-y-2">
        <label className="text-caption font-semibold text-ink flex items-center gap-1.5">
          <GraduationCap className="size-4 text-primary" />
          <span>Nivel de Estudios</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            selected={nivel === ''}
            onClick={() => updateFilter('nivel_estudios', '')}
          >
            Todos
          </Chip>
          <Chip
            selected={nivel === 'TSU'}
            onClick={() => updateFilter('nivel_estudios', 'TSU')}
          >
            TSU
          </Chip>
          <Chip
            selected={nivel === 'ING_LIC'}
            onClick={() => updateFilter('nivel_estudios', 'ING_LIC')}
          >
            Ingeniería / Lic.
          </Chip>
        </div>
      </div>

      {/* Área de Estudio */}
      <Field label="Área de Estudio">
        <Select
          value={area}
          onChange={(e) => updateFilter('area_estudio', e.target.value)}
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </Select>
      </Field>

      {/* Modalidad */}
      <Field label="Modalidad">
        <Select
          value={modalidad}
          onChange={(e) => updateFilter('modalidad', e.target.value)}
        >
          <option value="">Cualquier modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
          <option value="home_office">Remoto / Home Office</option>
        </Select>
      </Field>

      {/* Transporte UTH */}
      <div className="pt-2 border-t border-divider">
        <Checkbox
          label="Beneficio de Transporte UTH"
          description="Ruta institucional directa al parque industrial"
          checked={transporte}
          onChange={(e) => updateFilter('incluye_transporte', e.target.checked)}
        />
      </div>

      {/* Ordenamiento */}
      <Field label="Ordenar resultados">
        <Select
          value={ordering}
          onChange={(e) => updateFilter('ordering', e.target.value)}
        >
          <option value="-id">Más recientes</option>
          <option value="-sueldo_maximo">Mayor salario ofertado</option>
          <option value="sueldo_minimo">Menor salario ofertado</option>
        </Select>
      </Field>
    </Card>
  );
};
