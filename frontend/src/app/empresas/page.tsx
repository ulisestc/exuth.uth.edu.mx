import React from 'react';
import Link from 'next/link';
import { fetchPublicEmpresas, fetchGiros, fetchSectores } from '@/lib/api';
import { 
  Building2, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface EmpresasPageProps {
  searchParams: Promise<{
    search?: string;
    giro?: string;
    sector?: string;
  }>;
}

export const metadata = {
  title: 'Directorio de Empresas Vinculadas | Bolsa de Trabajo UTH',
  description: 'Conoce a las empresas y organizaciones en convenio con la Universidad Tecnológica de Huejotzingo que ofrecen oportunidades de estadías y empleo.',
};

export default async function EmpresasPage({ searchParams }: EmpresasPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const giro = resolvedParams.giro || '';
  const sector = resolvedParams.sector || '';

  const [empresas, giros, sectores] = await Promise.all([
    fetchPublicEmpresas(search, giro, sector),
    fetchGiros().catch(() => []),
    fetchSectores().catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Migas de pan / Regresar */}
      <div className="flex items-center gap-2 text-xs text-[#636569]">
        <Link href="/" className="hover:text-[#00A887] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#2D2926]">Empresas Vinculadas</span>
      </div>

      {/* Encabezado Principal Institucional */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="w-full h-1.5 flex absolute top-0 left-0">
          <div className="h-full w-2/3 bg-[#00A887]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00A887]">
              <ShieldCheck className="w-4 h-4" />
              Alianza Universidad - Empresa
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D2926] tracking-tight">
              Directorio de Empresas Vinculadas
            </h1>
            <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">
              Organizaciones del sector productivo con convenios de colaboración vigentes para estadías profesionales y contratación directa de egresados de la Universidad Tecnológica de Huejotzingo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-xl bg-emerald-50 text-[#00A887] border border-emerald-200 text-center">
              <span className="block text-2xl font-black">{empresas.length}</span>
              <span className="text-[11px] uppercase font-bold tracking-wider">Organizaciones Aliadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <form method="GET" action="/empresas" className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre de empresa o actividad..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] focus:border-[#00A887] transition-all bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs cursor-pointer shrink-0"
          >
            Buscar Empresas
          </button>

          {(search || giro || sector) && (
            <Link
              href="/empresas"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-all text-center shrink-0"
            >
              Limpiar Filtros
            </Link>
          )}
        </form>
      </div>

      {/* Grid de Empresas */}
      {empresas.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2D2926]">No se encontraron empresas</h3>
            <p className="text-xs text-[#636569] max-w-md mx-auto">
              No hay organizaciones vinculadas que coincidan con los criterios de búsqueda actuales. Intenta con otros términos o limpia los filtros.
            </p>
          </div>
          <Link
            href="/empresas"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#00A887] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-[#00A887]/20 transition-all"
          >
            Ver todas las empresas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {empresas.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-zinc-200 hover:border-[#00A887]/60 transition-all duration-200 hover:shadow-md p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#00A887]/10 border border-[#00A887]/20 flex items-center justify-center text-[#00A887] font-black text-lg shrink-0">
                      {emp.nombre ? emp.nombre.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div>
                      <Link 
                        href={`/empresas/${emp.id}`}
                        className="text-base font-bold text-[#2D2926] hover:text-[#00A887] transition-colors line-clamp-1"
                      >
                        {emp.nombre}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#00A887] font-semibold mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Convenio UTH Activo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#636569] line-clamp-2 leading-relaxed">
                  {emp.actividad_de_la_empresa || 'Empresa colaboradora del sector productivo vinculada con los programas educativos de la UTH.'}
                </p>

                <div className="space-y-1.5 text-xs text-[#636569] pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-medium text-[#2D2926]">{emp.sector}</span>
                    <span>·</span>
                    <span className="truncate">{emp.giro}</span>
                  </div>

                  {emp.domicilio && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{emp.domicilio}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-zinc-100 flex items-center justify-between gap-2">
                <Link
                  href={`/empresas/${emp.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:text-[#008F73] hover:underline"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Ver perfil y vacantes
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <a
                  href={`mailto:${emp.correo_contacto}`}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800"
                  title="Enviar correo institucional"
                >
                  <Mail className="w-3 h-3" />
                  Contacto
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Invitación a Empresas */}
      <div className="bg-gradient-to-r from-[#2D2926] to-[#3a3532] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C2BA98]/20 text-[#C2BA98] border border-[#C2BA98]/30">
            <Sparkles className="w-3.5 h-3.5" />
            Vinculación Estratégica
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            ¿Tu organización busca talento técnico y de ingeniería?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Regístrate en la Bolsa de Trabajo de la Universidad Tecnológica de Huejotzingo para publicar ofertas laborales, estadías profesionales y reclutar egresados calificados.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/registro?tipo=empresa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm"
          >
            Registrar Mi Empresa
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/login?tipo=empresa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
          >
            Portal Empresa
          </Link>
        </div>
      </div>
    </div>
  );
}
