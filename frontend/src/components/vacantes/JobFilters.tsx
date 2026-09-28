'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, RotateCcw, Bus, GraduationCap, Building2 } from 'lucide-react';
import { AreaEstudio } from '@/lib/api';

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
    <aside className="bg-white rounded-lg border border-zinc-200 p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-sm font-bold text-[#2D2926]">
          <Filter className="w-4 h-4 text-[#00A887]" />
          <span>Filtrar Vacantes</span>
        </div>
        {(search || area || nivel || modalidad || transporte) && (
          <button
            onClick={handleReset}
            className="text-xs text-[#636569] hover:text-[#A8123E] flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Búsqueda por texto */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#2D2926]">Buscar por palabra clave</label>
        <div className="relative">
          <input
            type="text"
            defaultValue={search}
            placeholder="Puesto, empresa o habilidad..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilter('search', (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full text-xs pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:border-[#00A887] text-[#2D2926]"
          />
          <Search className="w-3.5 h-3.5 text-[#A6A6A8] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Nivel Académico UTH */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#2D2926] flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#00A887]" />
          Nivel de Estudios
        </label>
        <div className="space-y-1.5 text-xs text-[#636569]">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#2D2926]">
            <input
              type="radio"
              name="nivel"
              checked={nivel === ''}
              onChange={() => updateFilter('nivel_estudios', '')}
              className="text-[#00A887] focus:ring-[#00A887]"
            />
            <span>Todos los niveles</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#2D2926]">
            <input
              type="radio"
              name="nivel"
              checked={nivel === 'TSU'}
              onChange={() => updateFilter('nivel_estudios', 'TSU')}
              className="text-[#00A887] focus:ring-[#00A887]"
            />
            <span>Técnico Superior Universitario (TSU)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#2D2926]">
            <input
              type="radio"
              name="nivel"
              checked={nivel === 'ING_LIC'}
              onChange={() => updateFilter('nivel_estudios', 'ING_LIC')}
              className="text-[#00A887] focus:ring-[#00A887]"
            />
            <span>Ingeniería / Licenciatura</span>
          </label>
        </div>
      </div>

      {/* Área de Estudio */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#2D2926]">Área de Estudio UTH</label>
        <select
          value={area}
          onChange={(e) => updateFilter('area_estudio', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:border-[#00A887] text-[#2D2926]"
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Modalidad de Trabajo */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#2D2926]">Modalidad</label>
        <select
          value={modalidad}
          onChange={(e) => updateFilter('modalidad', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:border-[#00A887] text-[#2D2926]"
        >
          <option value="">Todas las modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
          <option value="home_office">Remoto / Home Office</option>
        </select>
      </div>

      {/* Beneficio de Transporte UTH */}
      <div className="pt-2 border-t border-zinc-100">
        <label className="flex items-center gap-2 text-xs font-medium text-[#2D2926] cursor-pointer">
          <input
            type="checkbox"
            checked={transporte}
            onChange={(e) => updateFilter('incluye_transporte', e.target.checked)}
            className="w-3.5 h-3.5 rounded text-[#00A887] focus:ring-[#00A887]"
          />
          <span className="flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-[#691C32]" />
            Incluye Transporte
          </span>
        </label>
      </div>

      {/* Ordenamiento */}
      <div className="space-y-1.5 pt-2 border-t border-zinc-100">
        <label className="text-xs font-semibold text-[#2D2926]">Ordenar por</label>
        <select
          value={ordering}
          onChange={(e) => updateFilter('ordering', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:border-[#00A887] text-[#2D2926]"
        >
          <option value="-id">Más recientes</option>
          <option value="-sueldo_maximo">Mayor salario</option>
          <option value="sueldo_minimo">Menor salario</option>
        </select>
      </div>
    </aside>
  );
};
