'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ─────────────────────────────────────────────────────────────
 * Modal / hoja (DESIGN.md §7.6)
 * ──────────────────────────────────────────────────────────── */

const modalSizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
} as const;

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  footer,
  size = 'md',
  children,
  dismissible = true,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof modalSizes;
  children?: React.ReactNode;
  /** false = no se cierra con Esc ni clic fuera (p. ej. mientras se guarda) */
  dismissible?: boolean;
  bodyClassName?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const prevFocus = document.activeElement as HTMLElement | null;
    // Enfocar el panel para que Esc / Tab funcionen de inmediato
    requestAnimationFrame(() => panelRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-void/50 backdrop-blur-[8px]"
        onClick={() => dismissible && onClose()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-sheet-in flex-col overflow-hidden bg-canvas shadow-sheet outline-none',
          'rounded-t-card sm:rounded-card',
          modalSizes[size],
        )}
      >
        {(eyebrow || title || dismissible) && (
          <div className="flex items-start justify-between gap-4 border-b border-divider px-6 pb-4 pt-5">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-1 text-fine font-semibold uppercase tracking-wider text-wine">
                  {eyebrow}
                </p>
              )}
              {title && <h2 className="text-tagline text-ink">{title}</h2>}
              {description && <p className="mt-1 text-caption text-ink-64">{description}</p>}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="press -mr-2 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-parchment text-ink-64 hover:bg-divider hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto px-6 py-6', bodyClassName)}>{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-divider bg-pearl px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────
 * Pestañas (DESIGN.md §7.7)
 * ──────────────────────────────────────────────────────────── */

export interface TabItem<T extends string = string> {
  id?: T;
  value?: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  /** contador opcional (p. ej. pendientes) */
  count?: number;
}

/** Control segmentado en píldora — para 2 a 5 opciones. */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  size = 'md',
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-parchment p-1', className)}
    >
      {items.map((it) => {
        const itemKey = (it.id ?? it.value) as T;
        const active = itemKey === value;
        return (
          <button
            key={itemKey}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(itemKey)}
            className={cn(
              'press inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full cursor-pointer',
              size === 'sm' ? 'h-8 px-3 text-caption' : 'h-9 px-4 text-caption',
              active ? 'bg-canvas font-semibold text-ink ring-1 ring-hairline' : 'text-ink-64 hover:text-ink',
            )}
          >
            {it.icon && <it.icon className="size-4" />}
            {it.label}
            {typeof it.count === 'number' && it.count > 0 && (
              <span
                className={cn(
                  'ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-fine font-semibold',
                  active ? 'bg-primary text-white' : 'bg-divider text-ink-80',
                )}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Sub-navegación esmerilada de portales (sub-nav-frosted, §7.1)
 * ──────────────────────────────────────────────────────────── */

export function SubNav<T extends string>({
  title,
  items,
  value,
  onChange,
  action,
}: {
  title: React.ReactNode;
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  action?: React.ReactNode;
}) {
  const navRef = useRef<HTMLElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, items]);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    checkScroll();
  }, [value, checkScroll]);

  const scrollBy = (offset: number) => {
    navRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="frosted sticky top-16 z-40 border-b border-hairline bg-parchment/80">
      <div className="mx-auto flex h-[52px] w-full max-w-[1280px] items-center gap-3 sm:gap-4 xl:gap-6 px-3 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 text-tagline text-ink xl:block">{title}</span>
        
        <div className="relative flex min-w-0 flex-1 items-center h-full">
          {canScrollLeft && (
            <div className="absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-parchment via-parchment/90 to-transparent pr-4">
              <button
                type="button"
                onClick={() => scrollBy(-160)}
                className="press inline-flex size-6 items-center justify-center rounded-full bg-canvas text-ink ring-1 ring-hairline shadow-xs hover:bg-parchment cursor-pointer"
                aria-label="Desplazar pestañas hacia la izquierda"
              >
                <ChevronLeft className="size-3.5" />
              </button>
            </div>
          )}

          <nav
            ref={navRef}
            role="tablist"
            onScroll={checkScroll}
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
                if (navRef.current) {
                  navRef.current.scrollLeft += e.deltaY * 0.7;
                  checkScroll();
                }
              }
            }}
            className="-mb-px flex h-full min-w-0 flex-1 items-stretch gap-1 overflow-x-auto [scrollbar-width:none]"
          >
            {items.map((it) => {
              const itemKey = (it.id ?? it.value) as T;
              const active = itemKey === value;
              return (
                <button
                  key={itemKey}
                  ref={active ? activeTabRef : undefined}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    onChange(itemKey);
                  }}
                  className={cn(
                    'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 sm:px-3 text-fine sm:text-caption transition-colors',
                    active ? 'font-semibold text-ink' : 'text-ink-64 hover:text-ink',
                  )}
                >
                  {it.icon && <it.icon className="size-3.5 sm:size-4" />}
                  {it.label}
                  {typeof it.count === 'number' && it.count > 0 && (
                    <span className="inline-flex min-w-4.5 sm:min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-fine font-semibold text-white">
                      {it.count}
                    </span>
                  )}
                  {active && <span aria-hidden className="absolute inset-x-2.5 sm:inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />}
                </button>
              );
            })}
          </nav>

          {canScrollRight && (
            <div className="absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-parchment via-parchment/90 to-transparent pl-4">
              <button
                type="button"
                onClick={() => scrollBy(160)}
                className="press inline-flex size-6 items-center justify-center rounded-full bg-canvas text-ink ring-1 ring-hairline shadow-xs hover:bg-parchment cursor-pointer"
                aria-label="Desplazar pestañas hacia la derecha"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/**
 * Hook: sincroniza la pestaña activa con `?tab=` para que Atrás/compartir funcionen.
 * No usa useSearchParams para evitar requerir <Suspense> en páginas cliente.
 */
export function useTabParam<T extends string>(allowed: readonly T[], fallback: T) {
  const [tab, setTabState] = React.useState<T>(fallback);

  useEffect(() => {
    const read = () => {
      const t = new URLSearchParams(window.location.search).get('tab') as T | null;
      setTabState(t && allowed.includes(t) ? t : fallback);
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = React.useCallback(
    (t: T) => {
      setTabState(t);
      const url = new URL(window.location.href);
      if (t === fallback) url.searchParams.delete('tab');
      else url.searchParams.set('tab', t);
      window.history.pushState(null, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [fallback],
  );

  return [tab, setTab] as const;
}

/* ─────────────────────────────────────────────────────────────
 * Menú desplegable simple (hoja con sombra Hoja)
 * ──────────────────────────────────────────────────────────── */

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-2 min-w-60 animate-sheet-in overflow-hidden rounded-card bg-canvas p-1.5 shadow-sheet ring-1 ring-hairline',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  href,
  onClick,
  icon: Icon,
  children,
  tone = 'default',
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  const cls = cn(
    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-caption transition-colors',
    tone === 'danger' ? 'text-danger hover:bg-danger-tint' : 'text-ink hover:bg-parchment',
  );
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0 opacity-70" />}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} onClick={onClick} role="menuitem" className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} role="menuitem" className={cls}>
      {content}
    </button>
  );
}
