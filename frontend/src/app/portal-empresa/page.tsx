'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchMiPerfilEmpresa, 
  fetchMisVacantes, 
  cerrarVacante,
  EmpresaProfile, 
  VacanteEmpresaItem 
} from '@/lib/api';
import { NuevaVacanteModal } from '@/components/empresas/NuevaVacanteModal';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Lock,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  Mail,
  MapPin
} from 'lucide-react';

export default function PortalEmpresaPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [empresa, setEmpresa] = useState<EmpresaProfile | null>(null);
  const [vacantes, setVacantes] = useState<VacanteEmpresaItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accionEnProceso, setAccionEnProceso] = useState<number | null>(null);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?tipo=empresa&redirect=/portal-empresa');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cargar datos de la empresa y sus vacantes
  useEffect(() => {
    async function loadData() {
      if (accessToken && user?.rol === 'empresa') {
        try {
          const [perfilData, vacantesData] = await Promise.all([
            fetchMiPerfilEmpresa(accessToken),
            fetchMisVacantes(accessToken)
          ]);
          setEmpresa(perfilData);
          setVacantes(vacantesData);
        } catch (error) {
          console.error('Error loading empresa data:', error);
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    }

    if (accessToken) {
      loadData();
    }
  }, [accessToken, user]);

  const handleCerrarVacante = async (vacanteId: number, titulo: string) => {
    if (!window.confirm(`¿Confirmas que deseas cerrar la vacante "${titulo}"? Ya no recibirá nuevas postulaciones de egresados.`)) {
      return;
    }

    if (!accessToken) return;
    setAccionEnProceso(vacanteId);

    try {
      const res = await cerrarVacante(accessToken, vacanteId);
      if (res.success) {
        setVacantes(prev => prev.map(v => v.id === vacanteId ? { ...v, status: 'cerrada' } : v));
      } else {
        alert(res.error || 'No se pudo cerrar la vacante.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al procesar la solicitud.');
    } finally {
      setAccionEnProceso(null);
    }
  };

  const handleVacanteCreada = (nuevaVacante: VacanteEmpresaItem) => {
    setVacantes(prev => [nuevaVacante, ...prev]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            Aprobada y Vigente
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente de Aprobación UTH
          </span>
        );
      case 'cerrada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            Concluida / Cerrada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rechazada por UTH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  const formatFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  };

  const totalCandidatos = vacantes.reduce((sum, v) => sum + (v.num_postulaciones || 0), 0);
  const vacantesAprobadas = vacantes.filter(v => v.status === 'aprobada').length;

  if (authLoading || (loadingData && !empresa)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#691C32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando portal empresarial UTH...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner de Bienvenida Institucional */}
      <div className="bg-gradient-to-r from-[#2D2926] to-[#451824] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#691C32]/40 text-rose-200 border border-[#691C32]/60">
                <Building2 className="w-3.5 h-3.5" />
                Empresa Vinculada UTH
              </span>
              {empresa?.status === 'aprobada' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Convenio Acreditado
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {empresa?.nombre || `${user.nombres} ${user.apellido_paterno}`}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
              {empresa?.nombre_contacto && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C2BA98]" />
                  Contacto: {empresa.nombre_contacto} ({empresa.cargo_contacto || 'Representante'})
                </span>
              )}
              {empresa?.giro && (
                <>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#00A887]" />
                    {empresa.giro}
                  </span>
                </>
              )}
              {empresa?.domicilio && (
                <>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5 text-zinc-400 truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    {empresa.domicilio}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar Nueva Vacante
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

      {/* Grid de Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Vacantes */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingData ? '...' : vacantes.length}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Vacantes Registradas</h2>
            <p className="text-xs text-[#636569] mt-1">
              Total de ofertas laborales creadas por tu organización en la plataforma.
            </p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A887] hover:text-[#008F73] cursor-pointer"
          >
            + Registrar otra oferta
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vacantes Aprobadas */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingData ? '...' : vacantesAprobadas}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Ofertas Activas y Vigentes</h2>
            <p className="text-xs text-[#636569] mt-1">
              Vacantes aprobadas por Vinculación UTH disponibles para postulación.
            </p>
          </div>
          <Link
            href="/vacantes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
          >
            Ver bolsa pública UTH
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Candidatos Postulados */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#691C32]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingData ? '...' : totalCandidatos}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2926]">Candidatos Recibidos</h2>
            <p className="text-xs text-[#636569] mt-1">
              Egresados UTH que han solicitado ingresar al proceso de tus ofertas.
            </p>
          </div>
          <div className="text-[11px] text-[#636569] flex items-center gap-1.5 font-medium truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A887]" />
            <span>Filtro de pertinencia UTH</span>
          </div>
        </div>
      </div>

      {/* Listado de Vacantes de la Empresa */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden space-y-6">
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#2D2926]">
              Gestión de Ofertas Laborales Publicadas
            </h2>
            <p className="text-xs text-[#636569] mt-0.5">
              Supervisión de vacantes, estatus institucional de aprobación y recepción de candidatos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#691C32] bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              {vacantes.length} vacante(s)
            </span>
            <button
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Publicar
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#691C32] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">Cargando tus vacantes registradas...</p>
          </div>
        ) : vacantes.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2D2926]">
              Aún no has registrado vacantes de empleo
            </h3>
            <p className="text-xs text-[#636569] max-w-sm mx-auto">
              Publica tu primera oferta de empleo para vincularte con los egresados de TSU, Ingeniería y Licenciatura de la UTH.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setModalAbierto(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Publicar Primera Vacante
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {vacantes.map((v) => (
              <div 
                key={v.id} 
                className="p-6 hover:bg-zinc-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {v.clave_vacante}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                      {v.modalidad}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                      {v.tipo_contratacion?.replace('_', ' ')}
                    </span>
                    {getStatusBadge(v.status)}
                  </div>

                  <h3 className="text-base font-bold text-[#2D2926]">
                    {v.titulo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636569]">
                    <span className="flex items-center gap-1 font-medium text-zinc-700">
                      <Briefcase className="w-3.5 h-3.5 text-[#00A887]" />
                      {v.area_estudio_nombre || 'Área Tecnológica UTH'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Registrada el {formatFecha(v.fecha_registro)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-zinc-800">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {v.salario_a_tratar 
                        ? 'Salario a tratar' 
                        : v.sueldo_minimo && v.sueldo_maximo 
                          ? `$${Number(v.sueldo_minimo).toLocaleString('es-MX')} - $${Number(v.sueldo_maximo).toLocaleString('es-MX')} MXN`
                          : 'Sueldo competitivo'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
                    <Users className="w-3.5 h-3.5 text-[#00A887]" />
                    <span>{v.num_postulaciones || 0} candidato(s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vacantes/${v.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#00A887] hover:underline"
                    >
                      Ver en bolsa
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {v.status === 'aprobada' && (
                      <button
                        onClick={() => handleCerrarVacante(v.id, v.titulo)}
                        disabled={accionEnProceso === v.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-zinc-600 hover:text-red-700 hover:bg-red-50 border border-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                        title="Concluir y cerrar recepción de postulantes"
                      >
                        {accionEnProceso === v.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        Cerrar vacante
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guía Informativa para Empresas */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#2D2926]">
          Ciclo de Vinculación y Reclutamiento UTH
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#691C32]">Fase 1: Publicación</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Registro de la Oferta</h3>
            <p className="text-xs text-[#636569]">
              Completas los requisitos y condiciones del puesto. La vacante se registra con estatus <em>Pendiente</em>.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#00A887]">Fase 2: Aprobación UTH</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Validación de Pertinencia</h3>
            <p className="text-xs text-[#636569]">
              El Departamento de Vinculación UTH revisa la oferta y la publica para que los egresados afines comiencen a postularse.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="text-xs font-bold text-[#C2BA98]">Fase 3: Candidatos</div>
            <h3 className="text-sm font-bold text-[#2D2926]">Filtro Curricular</h3>
            <p className="text-xs text-[#636569]">
              Recibes los expedientes de los egresados cuyo perfil y currículum han sido validados institucionalmente por la universidad.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Publicación */}
      <NuevaVacanteModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        token={accessToken || ''}
        defaultContactoNombre={empresa?.nombre_contacto}
        onVacanteCreada={handleVacanteCreada}
      />
    </div>
  );
}
