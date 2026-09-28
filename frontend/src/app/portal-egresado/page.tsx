'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  GraduationCap, 
  Briefcase, 
  FileText, 
  UserCheck, 
  ArrowRight, 
  Clock, 
  Building2, 
  ExternalLink,
  LogOut,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function PortalEgresadoPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirigir a login si no está autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?tipo=egresado&redirect=/portal-egresado');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#00A887] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando portal de egresado...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner de Bienvenida Institucional */}
      <div className="bg-gradient-to-r from-[#2D2926] to-[#3a3532] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        {/* Pleca Institucional Bicolor */}
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
              <GraduationCap className="w-3.5 h-3.5" />
              Egresado UTH Verificado
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenida(o), {user.nombres} {user.apellido_paterno}
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Portal institucional de vinculación y desarrollo profesional de la Universidad Tecnológica de Huejotzingo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/vacantes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              Ver Vacantes
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-300 bg-white/10 hover:bg-white/15 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas y Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Mis Postulaciones */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">0</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Mis Postulaciones</h2>
            <p className="text-xs text-[#636569] mt-1">
              Rastreo en vivo del estatus de tus aplicaciones laborales validadas por UTH.
            </p>
          </div>
          <Link
            href="/vacantes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:text-[#008F73]"
          >
            Explorar catálogo de vacantes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tarjeta: Curriculum Vitae */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Pendiente
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Currículum Vitae (PDF)</h2>
            <p className="text-xs text-[#636569] mt-1">
              Sube tu CV actualizado para postularte con 1 clic a las empresas vinculadas.
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Próximamente disponible
          </span>
        </div>

        {/* Tarjeta: Estado Institucional */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Activo
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Padrón de Egresados</h2>
            <p className="text-xs text-[#636569] mt-1">
              Cuenta vinculada al sistema de Servicios Escolares de la UTH.
            </p>
          </div>
          <div className="text-[11px] text-[#636569] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            {user.email}
          </div>
        </div>
      </div>

      {/* Sección Informativa: Pasos para postularte */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#2D2926]">
          ¿Cómo funciona la Bolsa de Trabajo UTH?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#00A887]">Paso 1</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Explora y Filtra</h3>
            <p className="text-xs text-[#636569]">
              Revisa vacantes exclusivas para egresados de TSU e Ingeniería de la región de Huejotzingo y Puebla.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#691C32]">Paso 2</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Postúlate Directamente</h3>
            <p className="text-xs text-[#636569]">
              El Departamento de Vinculación UTH revisa tu perfil y envía tu información curricular a la empresa.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#C2BA98]">Paso 3</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Entrevista y Colocación</h3>
            <p className="text-xs text-[#636569]">
              Recibe notificaciones sobre el estado de tu postulación y fechas de entrevista laboral.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
