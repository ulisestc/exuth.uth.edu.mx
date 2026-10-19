import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Botón del sistema (DESIGN.md §7.2).
 * primary = la acción principal de la vista (una por vista).
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'utility'
  | 'dark'
  | 'wine'
  | 'pearl'
  | 'destructive'
  | 'danger'
  | 'on-dark'
  | 'secondary-on-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'press inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal select-none cursor-pointer ' +
  'disabled:opacity-40 disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover rounded-full',
  secondary: 'bg-transparent text-primary ring-1 ring-inset ring-primary hover:bg-primary-tint rounded-full',
  ghost: 'bg-transparent text-primary hover:bg-primary-tint rounded-full',
  utility: 'bg-ink text-white hover:bg-ink-80 rounded-utility',
  dark: 'bg-ink text-white hover:bg-ink-80 rounded-full',
  wine: 'bg-wine text-white hover:bg-[#521627] rounded-full',
  pearl: 'bg-pearl text-ink-80 ring-1 ring-inset ring-hairline hover:bg-parchment rounded-field',
  destructive: 'bg-danger text-white hover:bg-[#8e0f34] rounded-full',
  danger: 'bg-danger text-white hover:bg-[#8e0f34] rounded-full',
  'on-dark': 'bg-white text-ink hover:bg-cream rounded-full',
  'secondary-on-dark': 'bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10 rounded-full',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-caption',
  md: 'h-11 px-[22px] text-body',
  lg: 'h-[52px] px-7 text-body',
};

// Los utilitarios usan su propia escala compacta (14 px, 8 px de radio).
const utilitySizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-caption',
  md: 'h-9 px-[15px] text-caption',
  lg: 'h-11 px-5 text-caption',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  const sizeMap = variant === 'utility' || variant === 'pearl' ? utilitySizes : sizes;
  return cn(base, variants[variant], sizeMap[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  /** Icono a la izquierda (componente lucide ya instanciado) */
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  /** Icono a la derecha */
  iconRight?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    fullWidth,
    loading,
    icon,
    leftIcon,
    iconRight,
    rightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const leading = icon ?? leftIcon;
  const trailing = iconRight ?? rightIcon;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leading}
      {children}
      {!loading && trailing}
    </button>
  );
});

export interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

/** Enlace de texto verde (text-link / text-link-on-dark). */
export function TextLink({
  className,
  onDark,
  ...rest
}: React.ComponentProps<typeof Link> & { onDark?: boolean }) {
  return (
    <Link
      className={cn(
        'inline-flex items-center gap-1 underline-offset-4 hover:underline',
        onDark ? 'text-brand' : 'text-primary',
        className,
      )}
      {...rest}
    />
  );
}

/** Botón circular de icono, 44×44 (button-icon-circular). */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'chip' | 'plain' | 'on-dark' }
>(function IconButton({ label, tone = 'plain', className, children, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'press inline-flex size-11 shrink-0 items-center justify-center rounded-full',
        tone === 'chip' && 'bg-cream/65 text-ink hover:bg-cream',
        tone === 'plain' && 'text-ink-64 hover:bg-parchment hover:text-ink',
        tone === 'on-dark' && 'text-white/80 hover:bg-white/10 hover:text-white',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
