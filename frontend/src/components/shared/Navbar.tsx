'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UthLogo } from '../brand/UthLogo';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath, getRoleDisplayName } from '@/lib/auth';
import { 
  Building2, 
  UserCircle2, 
  LogOut, 
  GraduationCap, 
  ShieldCheck,
  User
} from 'lucide-react';

export const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getPortalLink = () => {
    if (!user) return '/login';
    return getRoleRedirectPath(user.rol);
  };

  const panelConfig = user ? (() => {
    switch (user.rol) {
      case 'egresado':
        return {
          label: 'Panel de Egresado',
          shortLabel: 'Mi Panel',
          icon: GraduationCap,
        };
      case 'empresa':
        return {
          label: 'Panel de Empresa',
          shortLabel: 'Panel Empresa',
          icon: Building2,
        };
      case 'admin_uth':
        return {
          label: 'Panel de Vinculación',
          shortLabel: 'Panel UTH',
          icon: ShieldCheck,
        };
      case 'soporte_ti':
        return {
          label: 'Panel de Administración',
          shortLabel: 'Panel TI',
          icon: ShieldCheck,
        };
      default:
        return {
          label: 'Mi Panel',
          shortLabel: 'Panel',
          icon: GraduationCap,
        };
    }
  })() : null;

  const PanelIcon = panelConfig?.icon;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      {/* Pleca Institucional Superior (Página 20 del Manual UTH) */}
      <div className="w-full h-1.5 flex">
        <div className="h-full w-2/3 bg-[#691C32]" />
        <div className="h-full w-1/3 bg-[#C2BA98]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo UTH Oficial */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <UthLogo variant="horizontal" />
          </Link>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-sm font-medium text-[#2D2926] hover:text-[#00A887] transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/vacantes" 
              className="text-sm font-medium text-[#636569] hover:text-[#00A887] transition-colors"
            >
              Explorar Vacantes
            </Link>
            <Link 
              href="/empresas" 
              className="text-sm font-medium text-[#636569] hover:text-[#00A887] transition-colors"
            >
              Empresas
            </Link>
            <Link 
              href="/eventos" 
              className="text-sm font-medium text-[#636569] hover:text-[#00A887] transition-colors"
            >
              Eventos
            </Link>
          </nav>

          {/* Estado de Sesión / Botones de Acceso */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user && panelConfig && PanelIcon ? (
              <div className="flex items-center gap-2">
                {/* Botón Principal Destacado: Pánel de [Rol] */}
                <Link
                  href={getPortalLink()}
                  className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-bold text-white bg-[#691C32] hover:bg-[#521627] rounded-lg shadow-sm transition-all"
                  title={`Ir a ${panelConfig.label}`}
                >
                  <PanelIcon className="w-4 h-4 text-[#C2BA98] shrink-0" />
                  <span className="hidden sm:inline">{panelConfig.label}</span>
                  <span className="sm:hidden">{panelConfig.shortLabel}</span>
                </Link>

                {/* Identificador de Usuario */}
                <div 
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-left"
                  title={`Conectado como ${user.email} (${getRoleDisplayName(user.rol)})`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#00A887] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {user.nombres.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-[#2D2926] leading-tight truncate max-w-[120px]">
                      {user.nombres.split(' ')[0]} {user.apellido_paterno}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium leading-none">
                      {getRoleDisplayName(user.rol)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-300 transition-all"
                >
                  Registrarse
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-md shadow-sm transition-all"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

