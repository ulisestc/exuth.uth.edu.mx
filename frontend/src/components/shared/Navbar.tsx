'use client';

import React from 'react';
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
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getPortalLink()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-[#00A887] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.nombres.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-[#2D2926] leading-tight truncate max-w-[130px]">
                      {user.nombres.split(' ')[0]} {user.apellido_paterno}
                    </div>
                    <div className="text-[10px] text-[#00A887] font-semibold leading-none">
                      {getRoleDisplayName(user.rol)}
                    </div>
                  </div>
                </Link>

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
                  href="/login?tipo=empresa"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-300 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#636569]" />
                  Soy Empresa
                </Link>
                <Link
                  href="/login?tipo=egresado"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-md shadow-sm transition-all"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Portal Egresado
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

