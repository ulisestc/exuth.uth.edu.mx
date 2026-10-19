'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UthLogo } from '../brand/UthLogo';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath, getRoleDisplayName } from '@/lib/auth';
import { ButtonLink, Pleca, Dropdown, MenuItem } from '@/components/ui';
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Briefcase,
  Calendar,
} from 'lucide-react';

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const getPortalLink = () => {
    if (!user) return '/login';
    return getRoleRedirectPath(user.rol);
  };

  const panelConfig = user
    ? (() => {
        switch (user.rol) {
          case 'egresado':
            return {
              label: 'Portal de Egresado',
              shortLabel: 'Mi Portal',
              icon: GraduationCap,
            };
          case 'empresa':
            return {
              label: 'Portal de Empresa',
              shortLabel: 'Empresa',
              icon: Building2,
            };
          case 'admin_uth':
            return {
              label: 'Vinculación UTH',
              shortLabel: 'Vinculación',
              icon: ShieldCheck,
            };
          case 'soporte_ti':
            return {
              label: 'Consola TI',
              shortLabel: 'Consola',
              icon: ShieldCheck,
            };
          default:
            return {
              label: 'Mi Portal',
              shortLabel: 'Portal',
              icon: GraduationCap,
            };
        }
      })()
    : null;

  const PanelIcon = panelConfig?.icon;

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/vacantes', label: 'Vacantes' },
    { href: '/empresas', label: 'Empresas' },
    { href: '/eventos', label: 'Eventos' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas/85 frosted border-b border-hairline transition-colors">
      {/* Pleca Institucional Superior Oficial */}
      <Pleca />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logotipo UTH Horizontal */}
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md p-1"
            aria-label="Inicio Bolsa de Trabajo UTH"
            onClick={() => setMobileMenuOpen(false)}
          >
            <UthLogo variant="horizontal" imgClassName="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Navegación de Escritorio */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-caption transition-colors ${
                    isActive
                      ? 'text-ink font-semibold'
                      : 'text-ink-64 hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones de Sesión */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
            {isAuthenticated && user && panelConfig && PanelIcon ? (
              <div className="flex items-center gap-2">
                <ButtonLink
                  href={getPortalLink()}
                  variant="primary"
                  size="sm"
                  icon={<PanelIcon className="size-4" />}
                >
                  <span className="hidden xl:inline">{panelConfig.label}</span>
                  <span className="xl:hidden">{panelConfig.shortLabel}</span>
                </ButtonLink>

                <Dropdown
                  align="right"
                  trigger={({ toggle, open }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded={open}
                      className="press flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full ring-1 ring-hairline hover:bg-parchment transition-colors"
                      title={`${user.nombres} (${getRoleDisplayName(user.rol)})`}
                    >
                      <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center text-fine font-semibold">
                        {user.nombres.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-caption font-medium text-ink max-w-[80px] xl:max-w-[120px] truncate">
                        {user.nombres.split(' ')[0]}
                      </span>
                      <ChevronDown className={`size-3.5 text-ink-64 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                >
                  {(close) => (
                    <>
                      <div className="px-3 py-2 border-b border-divider">
                        <p className="text-caption font-semibold text-ink truncate">
                          {user.nombres} {user.apellido_paterno}
                        </p>
                        <p className="text-fine text-ink-64 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-medium text-primary bg-primary-tint px-2 py-0.5 rounded-full">
                          {getRoleDisplayName(user.rol)}
                        </span>
                      </div>

                      <div className="py-1">
                        <MenuItem
                          href={getPortalLink()}
                          icon={PanelIcon}
                          onClick={close}
                        >
                          {panelConfig.label}
                        </MenuItem>
                        <MenuItem
                          href="/vacantes"
                          icon={Briefcase}
                          onClick={close}
                        >
                          Catálogo de Vacantes
                        </MenuItem>
                        <MenuItem
                          href="/eventos"
                          icon={Calendar}
                          onClick={close}
                        >
                          Eventos y Ferias
                        </MenuItem>
                      </div>

                      <div className="pt-1 border-t border-divider">
                        <MenuItem
                          tone="danger"
                          icon={LogOut}
                          onClick={() => {
                            close();
                            handleLogout();
                          }}
                        >
                          Cerrar sesión
                        </MenuItem>
                      </div>
                    </>
                  )}
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-caption font-medium text-ink-64 hover:text-ink transition-colors"
                >
                  Iniciar sesión
                </Link>
                <ButtonLink href="/registro" variant="primary" size="sm">
                  Registrarse
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && user && panelConfig && PanelIcon && (
              <ButtonLink
                href={getPortalLink()}
                variant="primary"
                size="sm"
                icon={<PanelIcon className="size-3.5" />}
              >
                <span>{panelConfig.shortLabel}</span>
              </ButtonLink>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="press p-2 rounded-full text-ink-64 hover:text-ink hover:bg-parchment transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-canvas animate-fade-in">
          <div className="px-5 py-5 space-y-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-field text-body ${
                      isActive
                        ? 'bg-parchment font-semibold text-ink'
                        : 'text-ink-64 hover:bg-pearl hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-divider">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <p className="text-body font-semibold text-ink">
                      {user.nombres} {user.apellido_paterno}
                    </p>
                    <p className="text-caption text-ink-64">{user.email}</p>
                    <p className="text-fine text-primary font-medium mt-0.5">
                      {getRoleDisplayName(user.rol)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <ButtonLink
                      href={getPortalLink()}
                      variant="primary"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Ir a mi Panel
                    </ButtonLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="press flex items-center justify-center gap-2 w-full py-2.5 text-caption font-semibold text-danger hover:bg-danger-tint rounded-full transition-colors"
                    >
                      <LogOut className="size-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <ButtonLink
                    href="/login"
                    variant="secondary"
                    fullWidth
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </ButtonLink>
                  <ButtonLink
                    href="/registro"
                    variant="primary"
                    fullWidth
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Crear cuenta
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
