'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchMisPostulaciones, 
  fetchMiPerfilEgresado, 
  Postulacion, 
  EgresadoProfile 
} from '@/lib/api';
import { CvManager } from '@/components/egresados/CvManager';
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
  Send,
  BookOpen,
  Award,
  UserCog,
  Phone,
  MapPin,
  Wrench
} from 'lucide-react';
import EditarPerfilEgresadoModal from '@/components/egresados/EditarPerfilEgresadoModal';

export default function PortalEgresadoPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(true);

  const [profile, setProfile] = useState<EgresadoProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [modalEditarPerfil, setModalEditarPerfil] = useState(false);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?tipo=egresado&redirect=/portal-egresado');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cargar perfil y postulaciones del egresado
  useEffect(() => {
    async function loadData() {
      if (accessToken && user?.rol === 'egresado') {
        try {
          const [postulacionesData, profileData] = await Promise.all([
            fetchMisPostulaciones(accessToken),
            fetchMiPerfilEgresado(accessToken),
          ]);
          setPostulaciones(postulacionesData);
          setProfile(profileData);
        } catch (error) {
          console.error('Error loading egresado data:', error);
        } finally {
          setLoadingPostulaciones(false);
          setLoadingProfile(false);
        }
      } else {
        setLoadingPostulaciones(false);
        setLoadingProfile(false);
      }
    }

    if (accessToken) {
      loadData();
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

  const getNivelEstudiosLabel = (nivel?: string) => {
    switch (nivel) {
      case 'TSU':
        return 'Técnico Superior Universitario';
      case 'ING_LIC':
        return 'Ingeniería / Licenciatura';
      case 'MTRIA':
        return 'Maestría';
      default:
        return nivel || 'TSU / Ingeniería';
    }
  };

  if (authLoading || (loadingProfile && !profile)) {
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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {profile?.es_verificado_padron ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Egresado UTH Verificado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  En Validación de Padrón
                </span>
              )}

              {profile?.matricula && (
                <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded text-zinc-300">
                  Matrícula: {profile.matricula}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenida(o), {user.nombres} {user.apellido_paterno}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#00A887]" />
                {profile?.carrera || 'Programa Académico UTH'}
              </span>
              <span className="text-zinc-500 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Award className="w-3.5 h-3.5 text-[#C2BA98]" />
                {getNivelEstudiosLabel(profile?.nivel_estudios)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setModalEditarPerfil(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 cursor-pointer shadow-xs"
              title="Editar datos de contacto y habilidades"
            >
              <UserCog className="w-4 h-4 text-[#00A887]" />
              Editar Perfil
            </button>
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              profile?.cv 
                ? 'bg-emerald-50 border border-emerald-100 text-[#00A887]' 
                : 'bg-amber-50 border border-amber-100 text-amber-700'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            {profile?.cv ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✓ Activo
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                ⚠️ Pendiente
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Currículum Vitae (PDF)</h2>
            <p className="text-xs text-[#636569] mt-1">
              {profile?.cv 
                ? 'Tu CV está cargado y listo para vincularte con empresas.' 
                : 'Sube tu CV actualizado para postularte con 1 clic a las empresas.'}
            </p>
          </div>
          <a
            href="#seccion-cv"
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
              profile?.cv 
                ? 'text-[#00A887] hover:text-[#008F73]' 
                : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            {profile?.cv ? 'Gestionar o actualizar CV' : 'Subir mi CV en PDF'}
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tarjeta: Estado Institucional */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              profile?.es_verificado_padron 
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}>
              {profile?.es_verificado_padron ? 'Verificado' : 'En Validación'}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Padrón de Egresados</h2>
            <p className="text-xs text-[#636569] mt-1">
              {profile?.curp ? `CURP: ${profile.curp}` : 'Cuenta vinculada a Servicios Escolares'}
            </p>
          </div>
          <div className="text-[11px] text-[#636569] flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887] shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Contacto y Habilidades */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#2D2926] flex items-center gap-2">
              <UserCog className="w-4 h-4 text-[#00A887]" />
              Mis Datos de Contacto y Perfil Profesional
            </h2>
            <p className="text-xs text-[#636569] mt-0.5">
              Información compartida con los reclutadores una vez que tu postulación es turnada por la UTH.
            </p>
          </div>
          <button
            onClick={() => setModalEditarPerfil(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#00A887] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserCog className="w-3.5 h-3.5" />
            Modificar Datos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#636569] flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#00A887]" />
              Teléfonos de Contacto
            </span>
            <p className="font-semibold text-[#2D2926]">
              {profile?.telefono_celular ? `Móvil: ${profile.telefono_celular}` : 'Sin celular registrado'}
            </p>
            {profile?.telefono_casa && (
              <p className="text-zinc-500 text-[11px]">Casa: {profile.telefono_casa}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#636569] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00A887]" />
              Domicilio Registrado
            </span>
            <p className="font-medium text-[#2D2926] line-clamp-2">
              {profile?.domicilio || 'No especificado'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#636569] flex items-center gap-1">
              <Wrench className="w-3 h-3 text-[#00A887]" />
              Habilidades y Competencias
            </span>
            <p className="font-medium text-[#2D2926] line-clamp-2">
              {profile?.habilidades || 'Sin habilidades registradas'}
            </p>
          </div>
        </div>
      </div>

      {/* Módulo Interactivo: Gestión de CV (PDF) */}
      <CvManager 
        profile={profile} 
        token={accessToken || ''} 
        onProfileUpdated={(updated) => setProfile(updated)} 
      />

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
            <div className="text-xs font-bold text-[#00A887]">Paso 1: Perfil y CV</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Expediente Digital</h3>
            <p className="text-xs text-[#636569]">
              Mantén tu CV en formato PDF cargado para que el departamento de vinculación cuente con tu historial.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#691C32]">Paso 2: Validación UTH</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Filtro Institucional</h3>
            <p className="text-xs text-[#636569]">
              La UTH revisa que cumplas con los requisitos de la vacante antes de turnar tu CV a la empresa.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#C2BA98]">Paso 3: Envío y Entrevista</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Contacto de la Empresa</h3>
            <p className="text-xs text-[#636569]">
              La empresa revisa tu currículum oficial y te contacta para agendar entrevistas de trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Perfil */}
      <EditarPerfilEgresadoModal
        isOpen={modalEditarPerfil}
        onClose={() => setModalEditarPerfil(false)}
        profile={profile}
        token={accessToken || ''}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </div>
  );
}
