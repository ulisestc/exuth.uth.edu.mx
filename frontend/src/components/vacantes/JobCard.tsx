import React from 'react';
import Link from 'next/link';
import {
  Building2,
  DollarSign,
  GraduationCap,
  Bus,
  Utensils,
  Clock,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Vacante } from '@/lib/api';
import { Card, Tag, Code, StatusPill, ButtonLink } from '@/components/ui';
import { getNivelLabel, getModalidadLabel, formatDate, formatMXN } from '@/lib/status';

interface JobCardProps {
  vacante: Vacante;
}

export const JobCard: React.FC<JobCardProps> = ({ vacante }) => {
  const getSueldoTexto = () => {
    if (vacante.salario_a_tratar) {
      return 'Sueldo a tratar';
    }
    if (vacante.sueldo_minimo && vacante.sueldo_maximo) {
      return `${formatMXN(vacante.sueldo_minimo)} – ${formatMXN(vacante.sueldo_maximo)} MXN`;
    }
    if (vacante.sueldo_minimo) {
      return `Desde ${formatMXN(vacante.sueldo_minimo)} MXN`;
    }
    return 'No especificado';
  };

  const modalidadTone =
    vacante.modalidad === 'home_office'
      ? 'success'
      : vacante.modalidad === 'hibrido'
      ? 'brand'
      : 'neutral';

  return (
    <Card
      className="group flex flex-col justify-between hover:ring-ink-48 transition-all relative overflow-hidden bg-canvas"
      padded
    >
      <div className="space-y-3.5">
        {/* Cabecera: Clave, Nivel y Modalidad */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Code>{vacante.clave_vacante || `VAC-${vacante.id}`}</Code>
            <span className="text-caption font-semibold text-primary">
              {getNivelLabel(vacante.nivel_estudios, true)}
            </span>
          </div>

          <StatusPill tone={modalidadTone} dot={vacante.modalidad !== 'presencial'}>
            {getModalidadLabel(vacante.modalidad)}
          </StatusPill>
        </div>

        {/* Título de la Vacante */}
        <div>
          <h3 className="text-body-strong text-ink group-hover:text-primary transition-colors">
            <Link href={`/vacantes/${vacante.id}`} className="focus-visible:outline-none focus-visible:underline">
              {vacante.titulo}
            </Link>
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-64 mt-1.5">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              {vacante.empresa_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vacante.empresa_logo}
                  alt={vacante.empresa_nombre || 'Empresa'}
                  className="size-4 object-contain rounded-utility shrink-0"
                />
              ) : (
                <Building2 className="size-4 text-primary shrink-0" />
              )}
              <span>{vacante.empresa_nombre || 'Empresa Vinculada UTH'}</span>
            </span>

            {vacante.area_estudio_nombre && (
              <span className="flex items-center gap-1">
                <GraduationCap className="size-4 text-ink-64 shrink-0" />
                <span className="truncate max-w-[200px]">{vacante.area_estudio_nombre}</span>
              </span>
            )}
          </div>
        </div>

        {/* Descripción breve */}
        <p className="text-caption text-ink-64 line-clamp-2 leading-relaxed">
          {vacante.responsabilidades ||
            vacante.experiencia ||
            'Consulta los requisitos completos y postúlate con tu cuenta de egresado UTH.'}
        </p>

        {/* Beneficios y Salario */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Tag icon={DollarSign}>
            <span className="font-semibold text-ink">{getSueldoTexto()}</span>
          </Tag>

          {vacante.incluye_transporte && (
            <Tag icon={Bus}>
              <span>Transporte UTH</span>
            </Tag>
          )}

          {vacante.incluye_comedor && (
            <Tag icon={Utensils}>
              <span>Comedor</span>
            </Tag>
          )}

          <Tag icon={Clock}>
            <span>
              {vacante.tipo_contratacion === 'tiempo_completo' ? 'Tiempo completo' : 'Indeterminado'}
            </span>
          </Tag>
        </div>
      </div>

      {/* Pie de la tarjeta */}
      <div className="mt-5 pt-3.5 border-t border-divider flex items-center justify-between text-caption">
        <span className="flex items-center gap-1.5 text-fine text-ink-64">
          <Calendar className="size-3.5 text-ink-48" />
          <span>{vacante.fecha_registro ? formatDate(vacante.fecha_registro) : 'Activa'}</span>
        </span>

        <ButtonLink
          href={`/vacantes/${vacante.id}`}
          variant="secondary"
          size="sm"
          iconRight={<ArrowRight className="size-3.5" />}
        >
          Ver vacante
        </ButtonLink>
      </div>
    </Card>
  );
};
