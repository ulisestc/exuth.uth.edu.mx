'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function PortalEmpresaPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?tipo=empresa&redirect=/portal-empresa');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#691C32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando portal empresarial...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-[#2D2926] to-[#451824] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#691C32]/40 text-rose-200 border border-[#691C32]/60">
              <Building2 className="w-3.5 h-3.5" />
              Empresa Vinculada UTH
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenido(a), {user.nombres} {user.apellido_paterno}
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Administración de vacantes y vinculación con talento de egresados de la Universidad Tecnológica de Huejotzingo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => alert('El formulario institucional para registrar nuevas vacantes estará disponible en el Paso 4 de la plataforma.')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar Vacante
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-300 bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">3</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Vacantes Registradas</h2>
            <p className="text-xs text-[#636569] mt-1">
              Ofertas laborales actualmente vigentes en la plataforma.
            </p>
          </div>
          <Link
            href="/vacantes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:text-[#008F73]"
          >
            Ver ofertas públicas
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">0</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Candidatos Postulados</h2>
            <p className="text-xs text-[#636569] mt-1">
              Egresados con CV validado por la coordinación de vinculación.
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Pendiente de postulaciones activas
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#691C32]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Aprobada
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Convenio Institucional</h2>
            <p className="text-xs text-[#636569] mt-1">
              Empresa acreditada formalmente para reclutamiento universitario.
            </p>
          </div>
          <div className="text-[11px] text-[#636569] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );
}
