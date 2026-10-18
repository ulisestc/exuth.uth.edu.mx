import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { UthLogo } from '@/components/brand/UthLogo';
import { fetchVacantes } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const todasVacantes = await fetchVacantes();
  const vacantesDestacadas = todasVacantes.slice(0, 4);

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'TSU': return 'Técnico Superior Universitario';
      case 'ING_LIC': return 'Ingeniería / Licenciatura';
      case 'MTRIA': return 'Maestría';
      default: return nivel;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[#F8FAFC] pt-12 pb-16 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Logo Oficial UTH */}
            <div className="flex justify-center mb-2">
              <UthLogo variant="cuadrado" imgClassName="h-20 sm:h-24 drop-shadow-xs" />
            </div>

            {/* Badge Institucional */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00A887]/10 text-[#00A887] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#00A887]" />
              Universidad Tecnológica de Huejotzingo
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2D2926] leading-tight">
              Bolsa de Trabajo y <span className="text-[#00A887]">Vinculación Laboral</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-[#636569] leading-relaxed">
              Conectamos el talento y las competencias de los egresados de la UTH con 
              las mejores oportunidades laborales en Puebla, Tlaxcala y la región.
            </p>

            {/* Buscador de Vacantes */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form 
                action="/vacantes" 
                method="GET"
                className="bg-white p-2 rounded-xl shadow-lg border border-zinc-200 flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="flex items-center gap-3 px-3 py-2 w-full sm:w-1/2">
                  <Search className="w-5 h-5 text-[#A6A6A8]" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Puesto, habilidad o carrera..."
                    className="w-full text-sm outline-none text-[#2D2926] placeholder:text-[#A6A6A8]"
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-zinc-200" />

                <div className="flex items-center gap-3 px-3 py-2 w-full sm:w-1/3">
                  <MapPin className="w-5 h-5 text-[#A6A6A8]" />
                  <select 
                    name="modalidad"
                    className="w-full text-sm outline-none text-[#636569] bg-transparent cursor-pointer"
                  >
                    <option value="">Cualquier modalidad</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="home_office">Remoto / Home Office</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#00A887] hover:bg-[#008F73] text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buscar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Metas / Estadísticas Rápidas */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-zinc-200/80 mt-8">
              <div>
                <span className="block text-2xl font-bold text-[#2D2926]">15+</span>
                <span className="text-xs text-[#636569]">Programas TSU</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#2D2926]">10+</span>
                <span className="text-xs text-[#636569]">Ingenierías y Licenciaturas</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#00A887]">40 km</span>
                <span className="text-xs text-[#636569]">Radio de vinculación</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#691C32]">42</span>
                <span className="text-xs text-[#636569]">Municipios (PUE y TLAX)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCESOS POR PERFIL (ROLES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-[#2D2926]">Portales del Ecosistema UTH</h2>
          <p className="text-sm text-[#636569]">
            Inicia sesión con tu cuenta institucional o regístrate según tu perfil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Egresado */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200 hover:border-[#00A887] transition-all hover:shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#00A887]/10 flex items-center justify-center text-[#00A887]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2926]">Egresados UTH</h3>
              <p className="text-xs text-[#636569] leading-relaxed">
                Postúlate a vacantes exclusivas, registra tu experiencia y mantén tu CV digital actualizado ante empresas de la región.
              </p>
              <ul className="text-xs text-[#2D2926] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  <span>Validación directa con matrícula UTH</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  <span>Alertas de nuevas vacantes por perfil</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-md transition-colors"
              >
                Iniciar Sesión
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/registro?tipo=egresado"
                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-[#00A887] hover:underline"
              >
                ¿No tienes cuenta? Regístrate como Egresado
              </Link>
            </div>
          </div>

          {/* Card Empresa */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200 hover:border-[#691C32] transition-all hover:shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#691C32]/10 flex items-center justify-center text-[#691C32]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2926]">Empresas y Organizaciones</h3>
              <p className="text-xs text-[#636569] leading-relaxed">
                Publica ofertas de trabajo, filtra candidatos por carrera o nivel de estudio y recluta profesionistas con perfil tecnológico.
              </p>
              <ul className="text-xs text-[#2D2926] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#691C32]" />
                  <span>Publicación y gestión de vacantes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#691C32]" />
                  <span>Acceso a perfiles TSU e Ingeniería</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#2D2926] hover:bg-black rounded-md transition-colors"
              >
                Iniciar Sesión
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/registro?tipo=empresa"
                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-[#691C32] hover:underline"
              >
                ¿Nueva empresa? Regístrate aquí
              </Link>
            </div>
          </div>

          {/* Card Vinculación / Admin */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200 hover:border-[#C2BA98] transition-all hover:shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#C2BA98]/20 flex items-center justify-center text-[#2D2926]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2926]">Vinculación Institucional</h3>
              <p className="text-xs text-[#636569] leading-relaxed">
                Aprobación de vacantes, seguimiento del desempeño de egresados y generación automatizada de reportes normativos.
              </p>
              <ul className="text-xs text-[#2D2926] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  <span>Validación de ofertas laborales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  <span>Estadísticas y reportes de egreso</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-300 transition-colors"
            >
              Acceso Administrativo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. VACANTES DESTACADAS (DINÁMICAS DESDE API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#00A887] mb-1">
              Oportunidades Recientes
            </div>
            <h2 className="text-2xl font-bold text-[#2D2926]">Vacantes para Egresados UTH</h2>
          </div>
          <Link
            href="/vacantes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:underline"
          >
            Ver todas las vacantes ({todasVacantes.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {vacantesDestacadas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-zinc-200 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-sm font-semibold text-[#2D2926]">
              No hay vacantes publicadas en este momento
            </p>
            <p className="text-xs text-[#636569]">
              Pronto se publicarán nuevas convocatorias validadas por Vinculación UTH.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vacantesDestacadas.map((vacante) => (
              <div
                key={vacante.id}
                className="bg-white p-5 rounded-lg border border-zinc-200 hover:border-[#00A887] transition-all hover:shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#00A887]/10 text-[#00A887] mb-2">
                      {getNivelLabel(vacante.nivel_estudios)}
                    </span>
                    <h3 className="text-base font-bold text-[#2D2926]">
                      {vacante.titulo}
                    </h3>
                    <p className="text-xs text-[#636569] mt-0.5">
                      {vacante.empresa_nombre || 'Empresa Vinculada UTH'}
                      {vacante.area_estudio_nombre ? ` · ${vacante.area_estudio_nombre}` : ''}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded uppercase shrink-0">
                    {vacante.modalidad.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-[#A6A6A8]">
                  <span>
                    {vacante.fecha_registro
                      ? `Publicado el ${new Date(vacante.fecha_registro).toLocaleDateString('es-MX')}`
                      : 'Convocatoria activa'}
                  </span>
                  <Link
                    href={`/vacantes/${vacante.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#00A887] hover:underline"
                  >
                    Ver detalles y postularme
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
