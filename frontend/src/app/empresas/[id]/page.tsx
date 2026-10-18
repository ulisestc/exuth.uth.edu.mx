import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchEmpresaById, fetchVacantesPorEmpresa } from '@/lib/api';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  ArrowLeft, 
  CheckCircle2, 
  DollarSign, 
  GraduationCap, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface EmpresaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EmpresaDetailPageProps) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);
  if (isNaN(empresaId)) return { title: 'Empresa no encontrada | UTH' };

  const empresa = await fetchEmpresaById(empresaId);
  if (!empresa) return { title: 'Empresa no encontrada | UTH' };

  return {
    title: `${empresa.nombre} | Directorio de Empresas UTH`,
    description: `Perfil corporativo y vacantes de ${empresa.nombre} en la Bolsa de Trabajo de la Universidad Tecnológica de Huejotzingo.`,
  };
}

export default async function EmpresaDetailPage({ params }: EmpresaDetailPageProps) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);
  if (isNaN(empresaId)) notFound();

  const [empresa, vacantes] = await Promise.all([
    fetchEmpresaById(empresaId),
    fetchVacantesPorEmpresa(empresaId),
  ]);

  if (!empresa) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb y Botón Volver */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/empresas"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#636569] hover:text-[#00A887] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Directorio de Empresas
        </Link>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">Inicio</Link>
          <span>/</span>
          <Link href="/empresas" className="hover:text-zinc-600">Directorio</Link>
          <span>/</span>
          <span className="text-[#2D2926] font-semibold truncate max-w-xs">{empresa.nombre}</span>
        </div>
      </div>

      {/* Header Corporativo de la Empresa */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#00A887]/10 to-[#00A887]/20 border border-[#00A887]/30 flex items-center justify-center text-[#00A887] font-black text-2xl sm:text-3xl shrink-0 shadow-xs">
              {empresa.nombre ? empresa.nombre.charAt(0).toUpperCase() : 'E'}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  Empresa Vinculada UTH
                </span>
                <span className="text-xs font-mono text-zinc-400">ID #{empresa.id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#2D2926] tracking-tight">
                {empresa.nombre}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                <span className="font-semibold text-[#00A887]">
                  {empresa.sector}
                </span>
                <span className="text-zinc-300">•</span>
                <span>{empresa.giro}</span>
                {empresa.campo && (
                  <>
                    <span className="text-zinc-300">•</span>
                    <span className="text-zinc-500">Campo: {empresa.campo}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <a
              href={`mailto:${empresa.correo_contacto}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] shadow-xs transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Contactar Organización
            </a>
          </div>
        </div>

        {/* Actividad Empresarial */}
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Actividad de la Organización
          </h3>
          <p className="text-xs sm:text-sm text-[#2D2926] leading-relaxed">
            {empresa.actividad_de_la_empresa || 'Organización colaboradora comprometida con el desarrollo profesional y la empleabilidad de la comunidad tecnológica de Huejotzingo.'}
          </p>
        </div>

        {/* Contacto & Ubicación Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {empresa.domicilio && (
            <div className="p-4 rounded-xl border border-zinc-200/80 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-[#00A887]" />
                Ubicación
              </div>
              <p className="text-xs text-[#2D2926] font-medium leading-snug">
                {empresa.domicilio}
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wide">
              <User className="w-4 h-4 text-[#691C32]" />
              Enlace de Vinculación
            </div>
            <p className="text-xs text-[#2D2926] font-bold">
              {empresa.nombre_contacto || 'Dirección de Recursos Humanos'}
            </p>
            <p className="text-[11px] text-[#636569]">
              {empresa.cargo_contacto || 'Representante Legal'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wide">
              <Phone className="w-4 h-4 text-[#C2BA98]" />
              Líneas de Contacto
            </div>
            <p className="text-xs text-[#2D2926] font-medium truncate">
              {empresa.telefono_oficina || empresa.telefono_celular || empresa.correo_contacto}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">
              {empresa.correo_contacto}
            </p>
          </div>
        </div>
      </div>

      {/* Ofertas Laborales Vigentes de esta Empresa */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-[#2D2926]">
              Ofertas Laborales Vigentes
            </h2>
            <p className="text-xs text-[#636569]">
              Vacantes autorizadas institucionalmente por la Universidad Tecnológica de Huejotzingo.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 text-[#2D2926]">
            {vacantes.length} {vacantes.length === 1 ? 'oferta' : 'ofertas'}
          </span>
        </div>

        {vacantes.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2D2926]">
              Sin vacantes activas en este momento
            </h3>
            <p className="text-xs text-[#636569] max-w-md mx-auto">
              Actualmente {empresa.nombre} no tiene convocatorias laborales vigentes. Explora otras empresas y vacantes en la bolsa universitaria.
            </p>
            <Link
              href="/vacantes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
            >
              Ver Todas las Vacantes UTH
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vacantes.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-zinc-200 hover:border-[#00A887]/60 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {v.clave_vacante || `VAC-${v.id}`}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Vigente
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#2D2926] group-hover:text-[#00A887] transition-colors leading-snug">
                    {v.titulo}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#636569]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#00A887]">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{v.area_estudio_nombre || 'Área Tecnológica'} ({v.nivel_estudios})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#2D2926] font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {v.salario_a_tratar
                          ? 'Sueldo a tratar'
                          : `$${parseFloat(v.sueldo_minimo || '0').toLocaleString('es-MX')} — $${parseFloat(v.sueldo_maximo || '0').toLocaleString('es-MX')} MXN`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Modalidad: {v.modalidad} · {v.tipo_contratacion}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#636569] line-clamp-2 leading-relaxed">
                    {v.responsabilidades || v.conocimientos || 'Consulta los requisitos y responsabilidades detalladas de esta vacante institucional.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Publicado en Bolsa UTH
                  </span>

                  <Link
                    href={`/vacantes/${v.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs"
                  >
                    Postularme / Ver Vacante
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
