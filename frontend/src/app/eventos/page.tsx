import React from 'react';
import Link from 'next/link';
import { fetchEventos, EventoItem } from '@/lib/api';
import { 
  Calendar, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Award,
  CalendarCheck
} from 'lucide-react';

interface EventosPageProps {
  searchParams: Promise<{
    tipo?: string;
  }>;
}

export const metadata = {
  title: 'Eventos de Empleabilidad | Bolsa de Trabajo UTH',
  description: 'Participa en ferias de empleo, reclutamientos en campus, conferencias y talleres organizados por la Universidad Tecnológica de Huejotzingo.',
};

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const resolvedParams = await searchParams;
  const tipo = resolvedParams.tipo || 'todos';

  const eventos: EventoItem[] = await fetchEventos(tipo);

  const getTipoLabel = (tipoKey: string) => {
    switch (tipoKey) {
      case 'feria_empleo':
        return 'Feria de Empleo';
      case 'reclutamiento_masivo':
        return 'Reclutamiento en Campus';
      case 'taller':
        return 'Taller Profesional';
      case 'conferencia':
        return 'Conferencia de Empleabilidad';
      default:
        return 'Evento Institucional';
    }
  };

  const getTipoBadgeColor = (tipoKey: string) => {
    switch (tipoKey) {
      case 'feria_empleo':
        return 'bg-emerald-50 text-[#00A887] border-emerald-200';
      case 'reclutamiento_masivo':
        return 'bg-rose-50 text-[#691C32] border-rose-200';
      case 'taller':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'conferencia':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const formatFechaHora = (fechaIso: string) => {
    try {
      const d = new Date(fechaIso);
      return d.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fechaIso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Migas de pan */}
      <div className="flex items-center gap-2 text-xs text-[#636569]">
        <Link href="/" className="hover:text-[#00A887] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#2D2926]">Eventos de Empleabilidad</span>
      </div>

      {/* Encabezado Institucional */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="w-full h-1.5 flex absolute top-0 left-0">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#691C32]">
              <Calendar className="w-4 h-4" />
              Dirección de Vinculación y Extensión
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D2926] tracking-tight">
              Eventos de Empleabilidad y Vinculación
            </h1>
            <p className="text-xs sm:text-sm text-[#636569] leading-relaxed">
              Ferias de empleo, reclutamientos masivos de empresas en campus, talleres para perfeccionar tu CV y conferencias con líderes de la industria para impulsar tu trayectoria profesional.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-xl bg-rose-50 text-[#691C32] border border-rose-200 text-center">
              <span className="block text-2xl font-black">{eventos.length}</span>
              <span className="text-[11px] uppercase font-bold tracking-wider">Eventos Activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por Categoría */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        {[
          { id: 'todos', label: 'Todos los Eventos' },
          { id: 'feria_empleo', label: 'Ferias de Empleo' },
          { id: 'reclutamiento_masivo', label: 'Reclutamiento en Campus' },
          { id: 'taller', label: 'Talleres de CV' },
          { id: 'conferencia', label: 'Conferencias' },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/eventos${tab.id === 'todos' ? '' : `?tipo=${tab.id}`}`}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              tipo === tab.id
                ? 'bg-[#00A887] text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-[#636569] hover:bg-zinc-50 hover:text-[#2D2926]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Grid de Eventos */}
      {eventos.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2D2926]">No hay eventos programados en esta categoría</h3>
            <p className="text-xs text-[#636569] max-w-md mx-auto">
              La Dirección de Vinculación y Extensión Universitaria publica continuamente nuevas actividades y jornadas de reclutamiento. Te sugerimos revisar periódicamente esta sección.
            </p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#00A887] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-[#00A887]/20 transition-all"
          >
            Ver todos los eventos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-zinc-200 hover:border-[#691C32]/50 transition-all duration-200 hover:shadow-md p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTipoBadgeColor(ev.tipo_evento)}`}>
                    <Calendar className="w-3 h-3" />
                    {getTipoLabel(ev.tipo_evento)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#2D2926] group-hover:text-[#691C32] transition-colors leading-snug">
                    {ev.nombre}
                  </h3>
                  <p className="text-xs text-[#636569] mt-2 line-clamp-3 leading-relaxed">
                    {ev.descripcion}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs text-[#636569]">
                  <div className="flex items-center gap-2 text-[#2D2926] font-medium">
                    <Clock className="w-4 h-4 text-[#00A887] shrink-0" />
                    <span>Inicio: {formatFechaHora(ev.fecha_inicio)}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#691C32] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{ev.lugar}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
                  Abierto a la Comunidad UTH
                </span>
                <Link
                  href="/portal-egresado"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#691C32] hover:text-[#501526] hover:underline"
                >
                  Registrarme
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner de Contacto Vinculación */}
      <div className="bg-gradient-to-r from-[#2D2926] to-[#451824] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
            <Sparkles className="w-3.5 h-3.5" />
            Servicio a Empresas y Egresados
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            ¿Deseas coordinar un reclutamiento en campus para tu empresa?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            La Dirección de Vinculación y Extensión Universitaria facilita espacios físicos y virtuales para ferias de empleo y procesos selectivos masivos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/login?tipo=empresa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm"
          >
            Acceder como Empresa
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
