import React from 'react';
import Link from 'next/link';
import { fetchEventos, EventoItem } from '@/lib/api';
import {
  Calendar,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import {
  Container,
  PageHeader,
  Card,
  ButtonLink,
  StatusPill,
  EmptyState,
  Tag,
} from '@/components/ui';

interface EventosPageProps {
  searchParams: Promise<{
    tipo?: string;
  }>;
}

export const metadata = {
  title: 'Eventos de Empleabilidad | Bolsa de Trabajo UTH',
  description:
    'Participa en ferias de empleo, reclutamientos en campus, conferencias y talleres organizados por la Universidad Tecnológica de Huejotzingo.',
};

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const resolvedParams = await searchParams;
  const tipo = resolvedParams.tipo || 'todos';

  const eventos: EventoItem[] = await fetchEventos(tipo).catch(() => []);

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
    <div className="py-10 sm:py-14 space-y-8">
      <Container size="console">
        {/* Migas de pan */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link href="/" className="hover:text-ink flex items-center gap-1.5 transition-colors font-medium">
            <ArrowLeft className="size-3.5" />
            <span>Inicio</span>
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">Eventos de Empleabilidad</span>
        </div>

        {/* Encabezado */}
        <PageHeader
          eyebrow="Vinculación y Reclutamiento"
          title="Eventos de Empleabilidad"
          description="Ferias de empleo, reclutamientos directos en campus, talleres y conferencias para egresados UTH."
          actions={
            <div className="rounded-card bg-parchment px-5 py-3 text-center sm:text-right">
              <span className="block text-display-md text-ink font-semibold tabular-nums">
                {eventos.length}
              </span>
              <span className="text-fine text-ink-64 uppercase tracking-wider">
                Eventos programados
              </span>
            </div>
          }
        />

        {/* Filtros por Categoría */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { id: 'todos', label: 'Todos los eventos' },
            { id: 'feria_empleo', label: 'Ferias de Empleo' },
            { id: 'reclutamiento_masivo', label: 'Reclutamientos' },
            { id: 'taller', label: 'Talleres' },
            { id: 'conferencia', label: 'Conferencias' },
          ].map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === 'todos' ? '/eventos' : `/eventos?tipo=${cat.id}`}
              className={`press px-4 py-2 rounded-full text-caption transition-colors ${
                tipo === cat.id
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-canvas ring-1 ring-hairline text-ink-64 hover:text-ink hover:bg-parchment'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Listado de Eventos */}
        <div className="mt-8">
          {eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventos.map((ev) => (
                <Card
                  key={ev.id}
                  padded
                  className="flex flex-col justify-between hover:ring-ink-48 transition-all bg-canvas space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <StatusPill tone="brand">
                        {getTipoLabel(ev.tipo_evento)}
                      </StatusPill>
                      <span className="text-fine text-ink-64">
                        {ev.is_active ? 'Activo' : 'Concluido'}
                      </span>
                    </div>

                    <h3 className="text-body-strong text-ink">{ev.nombre}</h3>

                    <p className="text-caption text-ink-64 line-clamp-3 leading-relaxed">
                      {ev.descripcion}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-divider text-caption text-ink-64">
                      <p className="flex items-center gap-2 text-ink">
                        <Clock className="size-4 text-primary shrink-0" />
                        <span className="font-medium">{formatFechaHora(ev.fecha_inicio)}</span>
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-ink-48 shrink-0" />
                        <span>{ev.lugar}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-divider">
                    <span className="inline-flex items-center justify-center gap-1.5 w-full h-10 text-caption text-ink-64 bg-parchment rounded-full">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>Acceso libre para la comunidad UTH</span>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padded>
              <EmptyState
                icon={Calendar}
                title="No hay eventos en esta categoría"
                description="La Dirección de Vinculación publicará próximamente nuevas fechas de ferias y reclutamientos."
                action={
                  <ButtonLink href="/eventos" variant="primary" size="sm">
                    Ver todos los eventos
                  </ButtonLink>
                }
              />
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
