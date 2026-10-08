import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  Bus, 
  Utensils, 
  Clock, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Vacante } from '@/lib/api';

interface JobCardProps {
  vacante: Vacante;
}

export const JobCard: React.FC<JobCardProps> = ({ vacante }) => {
  const formatSueldo = () => {
    if (vacante.salario_a_tratar) {
      return 'Sueldo a tratar en entrevista';
    }
    if (vacante.sueldo_minimo && vacante.sueldo_maximo) {
      const min = Number(vacante.sueldo_minimo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      const max = Number(vacante.sueldo_maximo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      return `${min} - ${max} MXN`;
    }
    if (vacante.sueldo_minimo) {
      const min = Number(vacante.sueldo_minimo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      return `Desde ${min} MXN`;
    }
    return 'No especificado';
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'TSU':
        return 'Técnico Superior Univ.';
      case 'ING_LIC':
        return 'Ingeniería / Licenciatura';
      case 'MTRIA':
        return 'Maestría';
      default:
        return nivel;
    }
  };

  const getModalidadBadge = (modalidad: string) => {
    switch (modalidad) {
      case 'home_office':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Remoto</span>;
      case 'hibrido':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Híbrido</span>;
      case 'presencial':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-[#2D2926] border border-zinc-200">Presencial</span>;
    }
  };

  const formattedDate = new Date(vacante.fecha_registro).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group bg-white rounded-lg border border-zinc-200/90 p-5 hover:border-[#00A887] hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
      {/* Indicador lateral sutil en hover con color UTH */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#00A887] transition-colors" />

      <div className="space-y-3">
        {/* Cabecera de la Vacante */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-[#636569] bg-zinc-100 px-2 py-0.5 rounded">
                {vacante.clave_vacante}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00A887]/10 text-[#00A887]">
                {getNivelLabel(vacante.nivel_estudios)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#2D2926] group-hover:text-[#00A887] transition-colors">
              <Link href={`/vacantes/${vacante.id}`}>
                {vacante.titulo}
              </Link>
            </h3>
          </div>
          {getModalidadBadge(vacante.modalidad)}
        </div>

        {/* Empresa y Ubicación */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#636569]">
          <span className="flex items-center gap-1.5 font-medium text-[#2D2926]">
            {vacante.empresa_logo ? (
              <img 
                src={vacante.empresa_logo} 
                alt={vacante.empresa_nombre || 'Empresa'} 
                className="w-4 h-4 object-contain rounded shrink-0" 
              />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-[#00A887]" />
            )}
            {vacante.empresa_nombre || 'Empresa Aliada UTH'}
          </span>
          {vacante.area_estudio_nombre && (
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#636569]" />
              {vacante.area_estudio_nombre}
            </span>
          )}
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{formatSueldo()}</span>
          </span>
        </div>

        {/* Breve descripción o responsabilidades */}
        <p className="text-xs text-[#636569] line-clamp-2 leading-relaxed">
          {vacante.responsabilidades || vacante.experiencia || 'Consulta los requisitos y postúlate a través de la Bolsa de Trabajo UTH.'}
        </p>

        {/* Beneficios / Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {vacante.incluye_transporte && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#2D2926] bg-[#C2BA98]/20 px-2 py-0.5 rounded border border-[#C2BA98]/40">
              <Bus className="w-3 h-3 text-[#691C32]" />
              Transporte UTH
            </span>
          )}
          {vacante.incluye_comedor && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#2D2926] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              <Utensils className="w-3 h-3 text-[#636569]" />
              Comedor
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-[#636569] bg-zinc-50 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            {vacante.tipo_contratacion === 'tiempo_completo' ? 'Tiempo Completo' : 'Contrato Indeterminado'}
          </span>
        </div>
      </div>

      {/* Footer de la tarjeta con fecha y botón de acción */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-[#A6A6A8] text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          Publicado {formattedDate}
        </span>

        <Link
          href={`/vacantes/${vacante.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#00A887] hover:text-white hover:bg-[#00A887] rounded border border-[#00A887] transition-all"
        >
          <span>Ver Detalle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
