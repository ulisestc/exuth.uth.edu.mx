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
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Globe,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ApplyButton } from '@/components/vacantes/ApplyButton';
import {
  Container,
  Card,
  StatusPill,
  Tag,
  Code,
  DataList,
  Alert,
} from '@/components/ui';
import { getNivelLabel, getModalidadLabel, formatMXN } from '@/lib/status';

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

  const getSueldoTexto = () => {
    if (vacante.salario_a_tratar) return 'Sueldo a tratar en entrevista';
    if (vacante.sueldo_minimo && vacante.sueldo_maximo) {
      return `${formatMXN(vacante.sueldo_minimo)} – ${formatMXN(vacante.sueldo_maximo)} MXN mensuales`;
    }
    if (vacante.sueldo_minimo) {
      return `Desde ${formatMXN(vacante.sueldo_minimo)} MXN mensuales`;
    }
    return 'No especificado';
  };

  return (
    <div className="py-10 sm:py-14 space-y-8">
      <Container size="console">
        {/* Navegación de retorno */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link
            href="/vacantes"
            className="hover:text-ink flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            <span>Catálogo de vacantes</span>
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-sm">{vacante.titulo}</span>
        </div>

        {/* Ficha Cabecera */}
        <Card className="p-6 sm:p-10 space-y-8 bg-canvas">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Code>{vacante.clave_vacante || `VAC-${vacante.id}`}</Code>
                <span className="text-caption font-semibold text-primary">
                  {getNivelLabel(vacante.nivel_estudios)}
                </span>
                <StatusPill tone="neutral">
                  {getModalidadLabel(vacante.modalidad)}
                </StatusPill>
                {vacante.es_inclusiva && (
                  <StatusPill tone="brand">Inclusiva</StatusPill>
                )}
              </div>

              <h1 className="text-display-md sm:text-display-lg text-ink font-semibold leading-tight">
                {vacante.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body text-ink-64 pt-1">
                <Link
                  href={`/empresas/${vacante.empresa}`}
                  className="flex items-center gap-2 font-medium text-ink hover:text-primary transition-colors"
                >
                  {vacante.empresa_logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vacante.empresa_logo}
                      alt={vacante.empresa_nombre || 'Empresa'}
                      className="size-5 object-contain rounded-utility shrink-0"
                    />
                  ) : (
                    <Building2 className="size-5 text-primary shrink-0" />
                  )}
                  <span>{vacante.empresa_nombre || 'Empresa Vinculada UTH'}</span>
                </Link>

                {vacante.area_estudio_nombre && (
                  <span className="flex items-center gap-1.5 text-caption">
                    <GraduationCap className="size-4 text-ink-64 shrink-0" />
                    <span>{vacante.area_estudio_nombre}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-lead text-primary font-semibold pt-1">
                <DollarSign className="size-5 shrink-0" />
                <span>{getSueldoTexto()}</span>
              </div>
            </div>

            {/* Acción Primaria: Postulación */}
            <div className="lg:self-center shrink-0">
              <ApplyButton
                vacanteId={vacante.id}
                vacanteTitulo={vacante.titulo}
                empresaNombre={vacante.empresa_nombre}
                documentosRequeridos={vacante.documentos_requeridos}
              />
            </div>
          </div>

          {/* Resumen Técnico de Condiciones */}
          <div className="pt-6 border-t border-divider">
            <DataList
              columns={3}
              items={[
                {
                  label: 'Tipo de Contratación',
                  value: vacante.tipo_contratacion === 'tiempo_completo' ? 'Tiempo completo' : 'Contrato indeterminado',
                  icon: Clock,
                },
                {
                  label: 'Horario Laboral',
                  value: vacante.horario_trabajo || 'Por definir',
                  icon: Clock,
                },
                {
                  label: 'Plazas Ofertadas',
                  value: `${vacante.num_candidatos || 1} plaza(s)`,
                  icon: Briefcase,
                },
                {
                  label: 'Transporte UTH',
                  value: vacante.incluye_transporte ? 'Incluido (ruta industrial)' : 'No contemplado',
                  icon: Bus,
                },
                {
                  label: 'Comedor',
                  value: vacante.incluye_comedor ? 'Servicio incluido' : 'No contemplado',
                  icon: Utensils,
                },
                {
                  label: 'Edad / Género Requerido',
                  value: `${vacante.edad || 'Indistinta'} · ${vacante.genero || 'Indistinto'}`,
                  icon: GraduationCap,
                },
              ]}
            />
          </div>
        </Card>

        {/* Contenido en dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Columna Principal: Requisitos y Saberes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actividades del Puesto */}
            {vacante.responsabilidades && (
              <Card padded className="space-y-4 bg-canvas">
                <h2 className="text-tagline text-ink flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" />
                  <span>Actividades y Responsabilidades</span>
                </h2>
                <p className="text-body text-ink-80 whitespace-pre-line leading-relaxed">
                  {vacante.responsabilidades}
                </p>
              </Card>
            )}

            {/* Perfil Requerido */}
            <Card padded className="space-y-6 bg-canvas">
              <h2 className="text-tagline text-ink flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" />
                <span>Perfil y Competencias Requeridas</span>
              </h2>

              {vacante.experiencia && (
                <div className="space-y-1">
                  <h3 className="text-caption font-semibold text-ink">Experiencia requerida:</h3>
                  <p className="text-body text-ink-80 leading-relaxed">{vacante.experiencia}</p>
                </div>
              )}

              {vacante.conocimientos && (
                <div className="space-y-1">
                  <h3 className="text-caption font-semibold text-ink">Conocimientos técnicos (Saberes):</h3>
                  <p className="text-body text-ink-80 leading-relaxed">{vacante.conocimientos}</p>
                </div>
              )}

              {vacante.habilidades && (
                <div className="space-y-1">
                  <h3 className="text-caption font-semibold text-ink">Habilidades prácticas:</h3>
                  <p className="text-body text-ink-80 leading-relaxed">{vacante.habilidades}</p>
                </div>
              )}

              {vacante.actitudes && (
                <div className="space-y-1">
                  <h3 className="text-caption font-semibold text-ink">Actitudes y valores:</h3>
                  <p className="text-body text-ink-80 leading-relaxed">{vacante.actitudes}</p>
                </div>
              )}

              {/* Idiomas */}
              {vacante.idiomas && vacante.idiomas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-divider">
                  <h3 className="text-caption font-semibold text-ink flex items-center gap-1.5">
                    <Globe className="size-4 text-primary" />
                    <span>Idiomas requeridos:</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vacante.idiomas.map((req, idx) => (
                      <Tag key={idx} icon={Globe}>
                        <span>{req.idioma_nombre || `Idioma #${req.idioma}`} · Nivel {req.nivel}</span>
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusión */}
              {vacante.es_inclusiva && vacante.capacidades_especiales && (
                <Alert tone="info" title="Inclusión Laboral">
                  {vacante.capacidades_especiales}
                </Alert>
              )}
            </Card>

            {/* Prestaciones */}
            {vacante.prestaciones && (
              <Card padded className="space-y-4 bg-canvas">
                <h2 className="text-tagline text-ink flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span>Prestaciones y Beneficios</span>
                </h2>
                <p className="text-body text-ink-80 leading-relaxed">
                  {vacante.prestaciones}
                </p>
              </Card>
            )}

            {/* Observaciones */}
            {vacante.observaciones && (
              <Card padded className="space-y-3 bg-canvas">
                <h3 className="text-caption font-semibold text-ink">Observaciones adicionales:</h3>
                <p className="text-caption text-ink-64 whitespace-pre-line leading-relaxed">
                  {vacante.observaciones}
                </p>
              </Card>
            )}
          </div>

          {/* Columna Lateral: Contacto y Validación */}
          <div className="space-y-6">
            {/* Contacto de la Empresa */}
            <Card padded className="space-y-4 bg-canvas">
              <span className="text-fine font-semibold text-wine uppercase tracking-wider block">
                Contacto de Selección
              </span>

              <div>
                <p className="text-body font-semibold text-ink">
                  {vacante.persona_contacto || vacante.empresa_contacto_nombre || 'Coordinación de Talento Humano'}
                </p>
                {vacante.empresa_contacto_cargo && (
                  <p className="text-caption text-ink-64">{vacante.empresa_contacto_cargo}</p>
                )}
              </div>

              <div className="space-y-2.5 pt-3 border-t border-divider text-caption">
                {vacante.empresa_correo && (
                  <a
                    href={`mailto:${vacante.empresa_correo}`}
                    className="flex items-center gap-2 text-primary hover:underline font-medium break-all"
                  >
                    <Mail className="size-4 shrink-0" />
                    <span>{vacante.empresa_correo}</span>
                  </a>
                )}

                {vacante.empresa_telefono && (
                  <p className="flex items-center gap-2 text-ink-64">
                    <Phone className="size-4 text-ink-48 shrink-0" />
                    <span>Oficina: <strong className="text-ink font-semibold">{vacante.empresa_telefono}</strong></span>
                  </p>
                )}

                {vacante.empresa_domicilio && (
                  <p className="flex items-start gap-2 text-ink-64">
                    <MapPin className="size-4 text-ink-48 shrink-0 mt-0.5" />
                    <span>{vacante.empresa_domicilio}</span>
                  </p>
                )}
              </div>

              {vacante.empresa && (
                <div className="pt-3 border-t border-divider">
                  <Link
                    href={`/empresas/${vacante.empresa}`}
                    className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:underline"
                  >
                    <span>Ver perfil de la empresa</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              )}
            </Card>

            {/* Documentos Requeridos */}
            <Card padded className="space-y-3 bg-canvas">
              <h3 className="text-caption font-semibold text-ink flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                <span>Documentos para Postulación</span>
              </h3>
              <p className="text-caption text-ink-64 leading-relaxed">
                {vacante.documentos_requeridos ||
                  'Currículum Vitae oficial en formato PDF, constancia de estudios o título y documento de identificación.'}
              </p>
            </Card>

            {/* Sello Oficial de Vinculación */}
            <Alert
              tone="success"
              title="Vacante Verificada por la UTH"
            >
              Esta convocatoria fue validada por el Departamento de Vinculación de la
              Universidad Tecnológica de Huejotzingo. Tu expediente se transmite de forma ética y directa.
            </Alert>
          </div>
        </div>
      </Container>
    </div>
  );
}
