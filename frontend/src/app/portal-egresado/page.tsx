'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchMisPostulaciones, Postulacion } from '@/lib/api';
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
  CheckCircle2,
  AlertCircle,
  Eye,
  Send
} from 'lucide-react';

export default function PortalEgresadoPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(true);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?tipo=egresado&redirect=/portal-egresado');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cargar postulaciones del egresado
  useEffect(() => {
    async function loadPostulaciones() {
      if (accessToken && user?.rol === 'egresado') {
        try {
          const data = await fetchMisPostulaciones(accessToken);
          setPostulaciones(data);
        } catch (error) {
          console.error('Error loading postulaciones:', error);
        } finally {
          setLoadingPostulaciones(false);
        }
      } else {
        setLoadingPostulaciones(false);
      }
    }

    if (accessToken) {
      loadPostulaciones();
    }
  }, [accessToken, user]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'revision_uth':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En Revisión por UTH
          </span>
        );
      case 'enviada_empresa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Enviada a Empresa
          </span>
        );
      case 'Aceptada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#00A887] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            Aceptada
          </span>
        );
      case 'rechazada_uth':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#A8123E] border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-[#A8123E]" />
            No cubre perfil UTH
          </span>
        );
      case 'Rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            Proceso Concluido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
            {estado}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading) {
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
              Explorar Vacantes
            </Link>
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

      {/* Grid de Estadísticas y Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Mis Postulaciones */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingPostulaciones ? '...' : postulaciones.length}
            </span>
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
          <div className="text-[11px] text-[#636569] flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887] shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Listado de Postulaciones en Tiempo Real */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden space-y-6">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#2D2926]">
              Historial de Postulaciones Laborales
            </h2>
            <p className="text-xs text-[#636569] mt-0.5">
              Estado de avance del filtro institucional UTH y envío a empresas aliadas.
            </p>
          </div>
          <span className="text-xs font-bold text-[#00A887] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            {postulaciones.length} registro(s)
          </span>
        </div>

        {loadingPostulaciones ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#00A887] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">Cargando tus postulaciones...</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2D2926]">
              Aún no tienes postulaciones activas
            </h3>
            <p className="text-xs text-[#636569] max-w-sm mx-auto">
              Explora las oportunidades laborales exclusivas para egresados de la UTH y postúlate con un solo clic.
            </p>
            <div className="pt-2">
              <Link
                href="/vacantes"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all"
              >
                Explorar Catálogo de Vacantes
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {postulaciones.map((p) => (
              <div key={p.id} className="p-6 hover:bg-zinc-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                      {p.vacante_clave || `VAC-${p.vacante}`}
                    </span>
                    {p.vacante_modalidad && (
                      <span className="text-[11px] font-semibold text-zinc-600 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                        {p.vacante_modalidad}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#2D2926]">
                    {p.vacante_titulo || `Vacante #${p.vacante}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                    <span className="flex items-center gap-1 font-medium text-zinc-700">
                      <Building2 className="w-3.5 h-3.5 text-[#00A887]" />
                      {p.vacante_empresa || 'Empresa Vinculada UTH'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Postulado el {formatDate(p.fecha_postulacion)}
                    </span>
                  </div>
                  {p.notas_uth && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                      <strong className="font-semibold">Nota UTH:</strong> {p.notas_uth}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                  {getStatusBadge(p.estado)}
                  <Link
                    href={`/vacantes/${p.vacante}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A887] hover:underline"
                  >
                    Ver detalles
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección Informativa: Pasos para postularte */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#2D2926]">
          ¿Cómo funciona el proceso de vinculación laboral?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#00A887]">Paso 1: Postulación</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Registro de Interés</h3>
            <p className="text-xs text-[#636569]">
              Al hacer clic en "Postularme", tu perfil entra al filtro de revisión institucional de la UTH.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#691C32]">Paso 2: Validación UTH</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Filtro de Vinculación</h3>
            <p className="text-xs text-[#636569]">
              El Departamento de Vinculación valida que tu carrera y competencias empaten con los requisitos de la empresa.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#C2BA98]">Paso 3: Envío y Entrevista</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Contacto de la Empresa</h3>
            <p className="text-xs text-[#636569]">
              La empresa recibe tu expediente aprobado y te convoca para el proceso de selección y contratación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
