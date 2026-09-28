'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ExternalLink, 
  FileCode, 
  Users, 
  Briefcase, 
  Building2, 
  Database, 
  LogOut,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function AdminUthPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?tipo=admin&redirect=/admin-uth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#2D2926] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando panel de administración UTH...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner de Bienvenida */}
      <div className="bg-[#2D2926] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administración y Vinculación Institucional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel UTH · {user.nombres} {user.apellido_paterno}
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Supervisión de vacantes, empresas en convenio, validación curricular de egresados y reportes normativos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="http://localhost:8080/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm"
            >
              <Database className="w-4 h-4" />
              Django Admin
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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

      {/* Accesos rápidos de administración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">3</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Vacantes en el Sistema</h2>
            <p className="text-xs text-[#636569] mt-1">
              Ofertas laborales activas y en proceso de revisión.
            </p>
          </div>
          <Link
            href="/vacantes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:text-[#008F73]"
          >
            Ver catálogo público
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
              <FileCode className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
              Swagger 3.0
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Documentación OpenAPI</h2>
            <p className="text-xs text-[#636569] mt-1">
              Esquemas de endpoints REST y contratos de datos.
            </p>
          </div>
          <a
            href="http://localhost:8080/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900"
          >
            Abrir Swagger UI
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              MySQL 8
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Base de Datos</h2>
            <p className="text-xs text-[#636569] mt-1">
              Padrón de egresados, empresas y postulaciones en MySQL.
            </p>
          </div>
          <a
            href="http://localhost:8080/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Gestionar en Django Admin
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
