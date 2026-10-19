import React from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UthLogo } from '@/components/brand/UthLogo';
import { fetchVacantes } from '@/lib/api';
import {
  Section,
  Container,
  Card,
  StatTile,
  ButtonLink,
  SearchInput,
  Select,
} from '@/components/ui';
import { JobCard } from '@/components/vacantes/JobCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const todasVacantes = await fetchVacantes().catch(() => []);
  const vacantesDestacadas = todasVacantes.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* ── 1. HERO INSTITUCIONAL (Lienzo Blanco) ────────────────── */}
      <Section tone="light" className="pt-16 pb-20 sm:pt-24 sm:pb-28">
        <Container size="content">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Imagotipo Institucional */}
            <div className="flex justify-center mb-3">
              <UthLogo
                variant="cuadrado"
                imgClassName="h-20 sm:h-24 w-auto object-contain"
              />
            </div>

            {/* Eyebrow Institucional Discreto */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-parchment ring-1 ring-hairline text-caption font-medium text-ink-80">
              <span className="size-2 rounded-full bg-brand" />
              <span>Universidad Tecnológica de Huejotzingo</span>
            </div>

            {/* Titular Principal */}
            <h1 className="text-display-md sm:text-hero font-semibold text-ink tracking-tight leading-[1.08]">
              El talento de la UTH, <br className="hidden sm:inline" />
              <span className="text-primary">conectado con la industria.</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lead-airy text-ink-64 max-w-2xl mx-auto leading-relaxed">
              Plataforma oficial de vinculación y bolsa de trabajo. Oportunidades validadas
              para profesionistas técnicos, ingenieros y licenciados en la región.
            </p>

            {/* Buscador Integrado Estilo Apple Pill */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form
                action="/vacantes"
                method="GET"
                className="bg-canvas p-2 rounded-full ring-1 ring-hairline hover:ring-ink-48 focus-within:ring-2 focus-within:ring-brand shadow-sm flex flex-col sm:flex-row items-center gap-2 transition-all"
              >
                <div className="flex items-center gap-2.5 px-4 py-2 w-full sm:w-1/2">
                  <Search className="size-4 text-ink-64 shrink-0" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Puesto, programa o habilidad…"
                    className="w-full text-body text-ink placeholder:text-ink-64/80 bg-transparent outline-none"
                  />
                </div>

                <div className="hidden sm:block w-px h-6 bg-divider" />

                <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:w-1/3">
                  <MapPin className="size-4 text-ink-64 shrink-0" />
                  <select
                    name="modalidad"
                    aria-label="Modalidad"
                    className="w-full text-caption text-ink-64 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="">Cualquier modalidad</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="home_office">Remoto</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="press w-full sm:w-auto px-6 h-11 bg-primary hover:bg-primary-hover text-white text-body font-medium rounded-full flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <span>Buscar</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>

            {/* Métricas Institucionales */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-divider text-left">
              <div className="p-3">
                <span className="block text-display-md text-ink font-semibold tabular-nums">15+</span>
                <span className="text-caption text-ink-64">Programas TSU</span>
              </div>
              <div className="p-3">
                <span className="block text-display-md text-ink font-semibold tabular-nums">10+</span>
                <span className="text-caption text-ink-64">Ingenierías y Lic.</span>
              </div>
              <div className="p-3">
                <span className="block text-display-md text-primary font-semibold tabular-nums">40 km</span>
                <span className="text-caption text-ink-64">Radio industrial</span>
              </div>
              <div className="p-3">
                <span className="block text-display-md text-ink font-semibold tabular-nums">42</span>
                <span className="text-caption text-ink-64">Municipios sede</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 2. PORTALES DEL ECOSISTEMA (Lienzo Pergamino) ───────── */}
      <Section tone="parchment">
        <Container size="content">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-display-md text-ink">Ecosistema Universitario</h2>
            <p className="text-caption text-ink-64 leading-relaxed">
              Ingresa al portal correspondiente con tus credenciales institucionales o date de alta en el sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Egresado */}
            <Card className="flex flex-col justify-between bg-canvas" padded>
              <div className="space-y-4">
                <div className="size-11 rounded-full bg-primary-tint flex items-center justify-center text-primary">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="text-tagline text-ink">Egresados UTH</h3>
                  <p className="text-caption text-ink-64 mt-1 leading-relaxed">
                    Postulaciones directas, seguimiento en tiempo real y vinculación con empresas de la región.
                  </p>
                </div>
                <ul className="space-y-2 text-caption text-ink-80 pt-2 border-t border-divider">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Validación directa con matrícula UTH</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Expediente curricular digital en PDF</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-divider flex flex-col gap-2.5">
                <ButtonLink href="/portal-egresado" variant="primary" fullWidth>
                  <span>Portal de Egresados</span>
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <Link
                  href="/registro?tipo=egresado"
                  className="text-center text-caption text-primary hover:underline"
                >
                  Registrar nueva cuenta de egresado
                </Link>
              </div>
            </Card>

            {/* Card Empresa */}
            <Card className="flex flex-col justify-between bg-canvas" padded>
              <div className="space-y-4">
                <div className="size-11 rounded-full bg-parchment flex items-center justify-center text-ink">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-tagline text-ink">Empresas e Industria</h3>
                  <p className="text-caption text-ink-64 mt-1 leading-relaxed">
                    Publicación de vacantes, acceso a candidatos con perfil tecnológico y convenios de vinculación.
                  </p>
                </div>
                <ul className="space-y-2 text-caption text-ink-80 pt-2 border-t border-divider">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Filtro de pertinencia académica</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Reclutamiento sin costo institucional</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-divider flex flex-col gap-2.5">
                <ButtonLink href="/portal-empresa" variant="utility" fullWidth>
                  <span>Portal de Empresa</span>
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <Link
                  href="/registro?tipo=empresa"
                  className="text-center text-caption text-primary hover:underline"
                >
                  Registrar nueva organización
                </Link>
              </div>
            </Card>

            {/* Card Vinculación */}
            <Card className="flex flex-col justify-between bg-canvas" padded>
              <div className="space-y-4">
                <div className="size-11 rounded-full bg-parchment flex items-center justify-center text-ink">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-tagline text-ink">Vinculación y Rectoría</h3>
                  <p className="text-caption text-ink-64 mt-1 leading-relaxed">
                    Auditoría de convocatorias, validación de convenios y generación de reportes normativos CACEI/ISO.
                  </p>
                </div>
                <ul className="space-y-2 text-caption text-ink-80 pt-2 border-t border-divider">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Validación de ofertas laborales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Control de padrón y acreditaciones</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-divider flex flex-col gap-2.5">
                <ButtonLink href="/admin-uth" variant="pearl" fullWidth>
                  <span>Consola de Vinculación</span>
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <span className="text-center text-fine text-ink-48">
                  Acceso restringido a personal universitario
                </span>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ── 3. VACANTES DESTACADAS (Lienzo Blanco) ──────────────── */}
      <Section tone="light">
        <Container size="content">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-caption font-semibold text-primary mb-1 uppercase tracking-wider">
                Oportunidades Recientes
              </p>
              <h2 className="text-display-md text-ink">Convocatorias para Egresados</h2>
            </div>
            <Link
              href="/vacantes"
              className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:underline"
            >
              <span>Ver todas las vacantes ({todasVacantes.length})</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {vacantesDestacadas.length === 0 ? (
            <Card className="text-center py-12 space-y-2" padded>
              <Briefcase className="size-8 text-ink-48 mx-auto" />
              <p className="text-body font-semibold text-ink">
                No hay vacantes públicas en este momento
              </p>
              <p className="text-caption text-ink-64">
                Pronto se publicarán nuevas convocatorias auditadas por Vinculación UTH.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vacantesDestacadas.map((vacante) => (
                <JobCard key={vacante.id} vacante={vacante} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ── 4. TESELA OSCURA DE IDENTIDAD UTH (Apple Tile 1) ────── */}
      <Section tone="dark" className="py-20 sm:py-28">
        <Container size="reading">
          <div className="text-center space-y-6">
            <span className="inline-block text-fine font-semibold uppercase tracking-widest text-cream">
              Compromiso Universitario
            </span>
            <h2 className="text-display-md sm:text-display-lg text-white font-semibold leading-tight">
              Formación técnica que impulsa la industria de Puebla y Tlaxcala.
            </h2>
            <p className="text-lead-airy text-cream leading-relaxed max-w-xl mx-auto">
              La UTH garantiza que cada egresado registrado posea formación pertinente,
              competencias prácticas de taller y respaldo de Servicios Escolares.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/registro?tipo=egresado" variant="on-dark">
                Registrarme como Egresado
              </ButtonLink>
              <ButtonLink href="/empresas" variant="secondary-on-dark">
                Directorio de Empresas Aliadas
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
