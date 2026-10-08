import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchVacanteById } from '@/lib/api';
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
  ArrowLeft,
  CheckCircle2,
  FileText,
  UserCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { ApplyButton } from '@/components/vacantes/ApplyButton';

interface VacanteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VacanteDetailPageProps) {
  const { id } = await params;
  const vacante = await fetchVacanteById(id);
  if (!vacante) return { title: 'Vacante no encontrada | UTH' };

  return {
    title: `${vacante.titulo} | Bolsa de Trabajo UTH`,
    description: `Vacante en ${vacante.empresa_nombre || 'Empresa UTH'} para egresados de la Universidad Tecnológica de Huejotzingo.`,
  };
}

export default async function VacanteDetailPage({ params }: VacanteDetailPageProps) {
  const { id } = await params;
  const vacante = await fetchVacanteById(id);

  if (!vacante) {
    notFound();
  }

  const formatSueldo = () => {
    if (vacante.salario_a_tratar) return 'Sueldo a tratar en entrevista';
    if (vacante.sueldo_minimo && vacante.sueldo_maximo) {
      const min = Number(vacante.sueldo_minimo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      const max = Number(vacante.sueldo_maximo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      return `${min} - ${max} MXN mensuales`;
    }
    if (vacante.sueldo_minimo) {
      const min = Number(vacante.sueldo_minimo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
      return `Desde ${min} MXN mensuales`;
    }
    return 'No especificado';
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'TSU': return 'Técnico Superior Universitario';
      case 'ING_LIC': return 'Ingeniería / Licenciatura';
      case 'MTRIA': return 'Maestría';
      default: return nivel;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navegación de retorno */}
      <Link 
        href="/vacantes" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#636569] hover:text-[#00A887] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Regresar al catálogo de vacantes
      </Link>

      {/* Cabecera Principal de la Vacante */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono tracking-wider text-[#636569] bg-zinc-100 px-2.5 py-0.5 rounded font-medium">
                {vacante.clave_vacante}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#00A887]/10 text-[#00A887]">
                {getNivelLabel(vacante.nivel_estudios)}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-[#2D2926] uppercase">
                {vacante.modalidad}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2926]">
              {vacante.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#636569]">
              <span className="flex items-center gap-1.5 font-semibold text-[#2D2926]">
                {vacante.empresa_logo ? (
                  <img 
                    src={vacante.empresa_logo} 
                    alt={vacante.empresa_nombre || 'Empresa'} 
                    className="w-5 h-5 object-contain rounded border border-zinc-200 shrink-0" 
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-[#00A887]" />
                )}
                {vacante.empresa_nombre || 'Empresa Aliada UTH'}
              </span>
              {vacante.area_estudio_nombre && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#636569]" />
                  {vacante.area_estudio_nombre}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[#00A887] font-bold">
                <DollarSign className="w-4 h-4" />
                {formatSueldo()}
              </span>
            </div>
          </div>

          {/* Botón de Postulación Primario */}
          <div className="sm:self-center">
            <ApplyButton 
              vacanteId={vacante.id} 
              vacanteTitulo={vacante.titulo} 
              empresaNombre={vacante.empresa_nombre} 
            />
          </div>
        </div>

        {/* Resumen de Condiciones Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-zinc-200/80 text-xs">
          <div>
            <span className="block text-[#A6A6A8] font-medium">Tipo de Contrato</span>
            <span className="font-semibold text-[#2D2926] capitalize">
              {vacante.tipo_contratacion.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="block text-[#A6A6A8] font-medium">Horario</span>
            <span className="font-semibold text-[#2D2926]">{vacante.horario_trabajo}</span>
          </div>
          <div>
            <span className="block text-[#A6A6A8] font-medium">Plazas a Cubrir</span>
            <span className="font-semibold text-[#2D2926]">{vacante.num_candidatos} candidato(s)</span>
          </div>
          <div>
            <span className="block text-[#A6A6A8] font-medium">Transporte Institucional</span>
            <span className="font-semibold text-[#2D2926]">
              {vacante.incluye_transporte ? '✅ Incluido' : 'No contemplado'}
            </span>
          </div>
        </div>
      </div>

      {/* Secciones de Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal: Requisitos y Responsabilidades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Responsabilidades */}
          {vacante.responsabilidades && (
            <section className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
              <h2 className="text-base font-bold text-[#2D2926] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#00A887]" />
                Actividades y Responsabilidades del Puesto
              </h2>
              <p className="text-xs sm:text-sm text-[#636569] leading-relaxed whitespace-pre-line">
                {vacante.responsabilidades}
              </p>
            </section>
          )}

          {/* Experiencia y Conocimientos */}
          <section className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#2D2926] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#00A887]" />
              Perfil y Competencias Requeridas
            </h2>
            
            {vacante.experiencia && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#2D2926]">Experiencia previa:</h4>
                <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">{vacante.experiencia}</p>
              </div>
            )}

            {vacante.conocimientos && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#2D2926]">Conocimientos técnicos (Saberes):</h4>
                <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">{vacante.conocimientos}</p>
              </div>
            )}

            {vacante.habilidades && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#2D2926]">Habilidades requeridas:</h4>
                <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">{vacante.habilidades}</p>
              </div>
            )}
          </section>

          {/* Prestaciones */}
          {vacante.prestaciones && (
            <section className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
              <h2 className="text-base font-bold text-[#2D2926] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00A887]" />
                Prestaciones y Beneficios
              </h2>
              <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">
                {vacante.prestaciones}
              </p>
            </section>
          )}
        </div>

        {/* Columna Lateral: Requisitos Documentales y Validación UTH */}
        <div className="space-y-6">
          {/* Documentación */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#691C32] flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Documentos Requeridos
            </h3>
            <p className="text-xs text-[#636569] leading-relaxed">
              {vacante.documentos_requeridos || 'CV actualizado en PDF, Carta de pasante o Título, RFC e identificación oficial.'}
            </p>
          </div>

          {/* Sello de Validación Institucional */}
          <div className="bg-[#00A887]/5 border border-[#00A887]/20 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00A887]">
              <CheckCircle2 className="w-4 h-4" />
              Vacante Verificada UTH
            </div>
            <p className="text-[11px] text-[#636569] leading-relaxed">
              Esta vacante fue validada por el Departamento de Vinculación de la Universidad Tecnológica de Huejotzingo. Tu postulación es enviada de forma directa y segura.
            </p>
          </div>

          {/* Contacto institucional */}
          {vacante.persona_contacto && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#A6A6A8] uppercase tracking-wider">
                Contacto de Selección
              </span>
              <p className="font-semibold text-[#2D2926]">{vacante.persona_contacto}</p>
              <p className="text-[11px] text-[#636569]">Coordinación de Talento Humano</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
