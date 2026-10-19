import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { StatusInfo, StatusTone } from '@/lib/status';

/* ─────────────────────────────────────────────────────────────
 * Contenedores y superficies (DESIGN.md §7.3)
 * ──────────────────────────────────────────────────────────── */

type ContainerSize = 'reading' | 'content' | 'console';
const containerSizes: Record<ContainerSize, string> = {
  reading: 'max-w-3xl',
  content: 'max-w-[1120px]',
  console: 'max-w-[1280px]',
};

export function Container({
  size = 'content',
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { size?: ContainerSize }) {
  return <div className={cn('mx-auto w-full px-5 sm:px-6 lg:px-8', containerSizes[size], className)} {...rest} />;
}

type SectionTone = 'light' | 'parchment' | 'dark';
const sectionTones: Record<SectionTone, string> = {
  light: 'bg-canvas text-ink',
  parchment: 'bg-parchment text-ink',
  dark: 'bg-tile text-white',
};

/** Tesela a sangre completa. El cambio de superficie es el divisor. */
export function Section({
  tone = 'light',
  compact,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { tone?: SectionTone; compact?: boolean }) {
  return (
    <section
      className={cn(sectionTones[tone], compact ? 'py-10 sm:py-14' : 'py-14 sm:py-20', className)}
      {...rest}
    />
  );
}

/** Tarjeta utilitaria: blanca, hairline, 18 px, sin sombra. */
export function Card({
  tone = 'canvas',
  padded = true,
  padding,
  interactive,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: 'canvas' | 'parchment' | 'dark';
  padded?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}) {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-4'
      : padding === 'lg'
      ? 'p-6 sm:p-8'
      : padding === 'md'
      ? 'p-5 sm:p-6'
      : padded
      ? 'p-6'
      : '';
  return (
    <div
      className={cn(
        'rounded-card',
        tone === 'canvas' && 'bg-canvas ring-1 ring-inset ring-hairline',
        tone === 'parchment' && 'bg-parchment',
        tone === 'dark' && 'bg-tile text-white',
        padClass,
        interactive && 'transition-colors hover:ring-ink-48',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 className="text-tagline text-ink">{title}</h2>
        {description && <p className="mt-1 text-caption text-ink-64">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Encabezado de página interna. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-caption font-semibold text-wine">{eyebrow}</p>}
        <h1 className="text-display-md text-ink md:text-display-lg">{title}</h1>
        {description && <p className="mt-3 text-lead-airy text-ink-64">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

/** Métrica: número grande + etiqueta. Sin iconos de colores. */
export function StatTile({
  label,
  value,
  hint,
  helper,
  icon,
  tone = 'parchment',
  loading,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'parchment' | 'canvas' | 'dark';
  loading?: boolean;
  className?: string;
}) {
  const sub = hint ?? helper;
  return (
    <div
      className={cn(
        'rounded-card p-6',
        tone === 'parchment' && 'bg-parchment',
        tone === 'canvas' && 'bg-canvas ring-1 ring-inset ring-hairline',
        tone === 'dark' && 'bg-tile-2 text-white',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-caption', tone === 'dark' ? 'text-cream' : 'text-ink-64')}>{label}</p>
        {icon && <span className={cn('shrink-0', tone === 'dark' ? 'text-cream/80' : 'text-ink-48')}>{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-16" />
      ) : (
        <p className="mt-2 text-display-md tabular-nums">{value}</p>
      )}
      {sub && <p className={cn('mt-1 text-caption', tone === 'dark' ? 'text-cream' : 'text-ink-64')}>{sub}</p>}
    </div>
  );
}

/** Estado vacío: icono, título, texto y UN CTA. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const Comp = Icon as React.ComponentType<{ className?: string }>;
    return <Comp className="size-6" />;
  };
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-parchment text-ink-64">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-body font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-caption text-ink-64">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-field bg-divider', className)} />;
}

/** Pantalla de carga de página completa (portales). */
export function PageLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="size-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-caption text-ink-64">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Estatus y etiquetas (DESIGN.md §7.5)
 * ──────────────────────────────────────────────────────────── */

const toneClasses: Record<StatusTone, { pill: string; dot: string }> = {
  success: { pill: 'bg-primary-tint text-primary', dot: 'bg-brand' },
  brand: { pill: 'bg-primary text-white', dot: 'bg-white' },
  warning: { pill: 'bg-warning-tint text-warning-ink', dot: 'bg-gold' },
  warn: { pill: 'bg-warning-tint text-warning-ink', dot: 'bg-gold' },
  info: { pill: 'bg-parchment text-ink', dot: 'bg-primary' },
  wine: { pill: 'bg-wine/10 text-wine', dot: 'bg-wine' },
  neutral: { pill: 'bg-parchment text-ink', dot: 'bg-ink-64' },
  danger: { pill: 'bg-danger-tint text-danger', dot: 'bg-danger' },
  muted: { pill: 'bg-divider text-ink-64', dot: 'bg-ink-48' },
};

export function StatusPill({
  status,
  tone,
  icon,
  children,
  dot = true,
  className,
  title,
}: {
  status?: StatusInfo;
  tone?: StatusTone;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  dot?: boolean;
  className?: string;
  title?: string;
}) {
  const t = toneClasses[tone ?? status?.tone ?? 'neutral'] ?? toneClasses.neutral;
  return (
    <span
      title={title ?? status?.hint}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-caption font-semibold',
        t.pill,
        className,
      )}
    >
      {icon ? icon : dot ? <span aria-hidden className={cn('size-1.5 rounded-full', t.dot)} /> : null}
      {children ?? status?.label}
    </span>
  );
}

/** Etiqueta neutra de metadato (modalidad, nivel, beneficio). */
export function Tag({
  icon: Icon,
  tone = 'neutral',
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'neutral' | 'wine' | 'gold' | 'primary' | 'success' | 'warn' | 'danger';
  className?: string;
  children: React.ReactNode;
}) {
  const toneCls =
    tone === 'wine'
      ? 'bg-wine/10 text-wine'
      : tone === 'gold'
      ? 'bg-gold/25 text-ink'
      : tone === 'primary' || tone === 'success'
      ? 'bg-primary-tint text-primary'
      : tone === 'warn'
      ? 'bg-warning-tint text-warning-ink'
      : tone === 'danger'
      ? 'bg-danger-tint text-danger'
      : 'bg-parchment text-ink-80';
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption',
        toneCls,
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-ink-64" />}
      {children}
    </span>
  );
}

/** Clave oficial (UTH-2026-VAC-…) en monoespaciado. */
export function Code({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('rounded-[6px] bg-parchment px-1.5 py-0.5 font-mono text-fine text-ink-64', className)}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Avisos en línea
 * ──────────────────────────────────────────────────────────── */

const alertTones = {
  info: { cls: 'bg-parchment text-ink', Icon: Info, icon: 'text-ink-64' },
  success: { cls: 'bg-primary-tint text-ink', Icon: CheckCircle2, icon: 'text-primary' },
  warning: { cls: 'bg-warning-tint text-ink', Icon: TriangleAlert, icon: 'text-warning-ink' },
  warn: { cls: 'bg-warning-tint text-ink', Icon: TriangleAlert, icon: 'text-warning-ink' },
  danger: { cls: 'bg-danger-tint text-ink', Icon: AlertCircle, icon: 'text-danger' },
} as const;

export function Alert({
  tone = 'info',
  title,
  icon,
  children,
  action,
  onDismiss,
  className,
}: {
  tone?: keyof typeof alertTones;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const t = alertTones[tone] ?? alertTones.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-field px-4 py-3 text-caption', t.cls, className)}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : <t.Icon className={cn('mt-0.5 size-4 shrink-0', t.icon)} aria-hidden />}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'text-ink-80')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-caption font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}

/** Pleca institucional (guinda 2/3 · dorado 1/3). Una sola por página. */
export function Pleca({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex h-1 w-full', className)}>
      <div className="h-full w-2/3 bg-wine" />
      <div className="h-full w-1/3 bg-gold" />
    </div>
  );
}

/** Lista de definición compacta para fichas (label / valor). */
export function DataList({
  items,
  columns = 2,
  className,
}: {
  items: { label: React.ReactNode; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-8 gap-y-5',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-caption text-ink-64">
            {it.icon && <it.icon className="size-3.5" />}
            {it.label}
          </dt>
          <dd className="mt-1 break-words text-body text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
