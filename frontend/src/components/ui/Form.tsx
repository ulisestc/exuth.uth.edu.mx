'use client';

import React, { useId } from 'react';
import { AlertCircle, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ─────────────────────────────────────────────────────────────
 * Formularios (DESIGN.md §7.4)
 * Label arriba · control · ayuda · error debajo. Nunca placeholder como label.
 * ──────────────────────────────────────────────────────────── */

const FieldContext = React.createContext<{ id?: string; describedBy?: string; invalid?: boolean }>({});

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
  id: idProp,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label htmlFor={id} className="text-caption font-semibold text-ink">
            {label}
            {required && (
              <span className="ml-0.5 text-danger" aria-hidden>
                *
              </span>
            )}
            {optional && <span className="ml-1.5 font-normal text-ink-64">(opcional)</span>}
          </label>
        )}
        {children}
        {hint && !error && (
          <p id={hintId} className="text-caption text-ink-64">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-start gap-1.5 text-caption text-danger">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldProps<T extends { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: unknown }>(props: T) {
  const ctx = React.useContext(FieldContext);
  return {
    id: props.id ?? ctx.id,
    'aria-describedby': props['aria-describedby'] ?? ctx.describedBy,
    'aria-invalid': (props['aria-invalid'] as boolean | undefined) ?? (ctx.invalid || undefined),
  };
}

export const controlBase =
  'w-full rounded-field bg-canvas text-body text-ink ring-1 ring-inset ring-ink/15 ' +
  'transition-shadow outline-none placeholder:text-ink-64/80 ' +
  'focus:ring-2 focus:ring-brand focus-visible:outline-none ' +
  'aria-[invalid=true]:ring-danger disabled:bg-parchment disabled:text-ink-64 disabled:cursor-not-allowed';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { leading?: React.ReactNode }>(
  function Input({ className, leading, ...props }, ref) {
    const a11y = useFieldProps(props);
    if (leading) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-64">{leading}</span>
          <input ref={ref} {...props} {...a11y} className={cn(controlBase, 'h-11 pl-10 pr-3.5', className)} />
        </div>
      );
    }
    return <input ref={ref} {...props} {...a11y} className={cn(controlBase, 'h-11 px-3.5', className)} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    const a11y = useFieldProps(props);
    return (
      <textarea ref={ref} rows={rows} {...props} {...a11y} className={cn(controlBase, 'min-h-24 px-3.5 py-2.5', className)} />
    );
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    const a11y = useFieldProps(props);
    return (
      <div className="relative">
        <select
          ref={ref}
          {...props}
          {...a11y}
          className={cn(controlBase, 'h-11 cursor-pointer appearance-none pl-3.5 pr-10', className)}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-64"
        />
      </div>
    );
  },
);

/** Buscador en píldora (search-input). */
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'md' | 'lg';
    onClear?: () => void;
  }
>(function SearchInput({ className, size = 'md', onClear, value, ...props }, ref) {
  return (
    <div className="relative w-full">
      <Search
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-64',
          size === 'lg' ? 'left-5 size-5' : 'left-4 size-4',
        )}
      />
      <input
        ref={ref}
        type="search"
        value={value}
        {...props}
        className={cn(
          'w-full rounded-full bg-canvas text-body text-ink ring-1 ring-inset ring-ink/12 outline-none',
          'placeholder:text-ink-64/80 focus:ring-2 focus:ring-brand',
          size === 'lg' ? 'h-14 pl-13 pr-5' : 'h-12 pl-11 pr-4',
          onClear && value ? 'pr-16' : '',
          className,
        )}
      />
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fine font-semibold text-ink-64 hover:text-ink cursor-pointer"
        >
          Limpiar
        </button>
      )}
    </div>
  );
});

/** Casilla con etiqueta clicable. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: React.ReactNode;
  description?: React.ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={props.id ?? id} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        id={props.id ?? id}
        type="checkbox"
        {...props}
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded-[5px] accent-primary"
      />
      <span className="text-caption text-ink">
        {label}
        {description && <span className="mt-0.5 block text-ink-64">{description}</span>}
      </span>
    </label>
  );
}

/** Chip de filtro (filter-chip / filter-chip-selected). */
export function Chip({
  selected,
  className,
  children,
  type = 'button',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'press inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-caption',
        selected
          ? 'bg-primary-tint text-primary ring-2 ring-inset ring-brand font-semibold'
          : 'bg-canvas text-ink-80 ring-1 ring-inset ring-hairline hover:ring-ink-48',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Zona de carga de archivo (rounded-card, borde punteado). */
export function FileDrop({
  accept,
  onFile,
  disabled,
  title = 'Selecciona un archivo',
  hint,
  icon,
  className,
}: {
  accept?: string;
  onFile: (file: File) => void;
  disabled?: boolean;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const [drag, setDrag] = React.useState(false);
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !disabled) onFile(f);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors',
        drag ? 'border-brand bg-primary-tint' : 'border-hairline bg-pearl hover:border-ink-48',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {icon}
      <span className="text-body font-semibold text-ink">{title}</span>
      {hint && <span className="text-caption text-ink-64">{hint}</span>}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
    </label>
  );
}
