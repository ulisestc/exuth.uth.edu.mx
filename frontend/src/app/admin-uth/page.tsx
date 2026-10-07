'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Send,
  RefreshCw
} from 'lucide-react';
import VacantesAuditor from '@/components/admin/VacantesAuditor';
import PostulacionesFiltro from '@/components/admin/PostulacionesFiltro';
import EmpresasValidador from '@/components/admin/EmpresasValidador';
import { 
  fetchAdminVacantes, 
  fetchAdminPostulaciones, 
  fetchAdminEmpresas 
} from '@/lib/api';

export default function AdminUthPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'vacantes' | 'postulaciones' | 'empresas'>('vacantes');

  // Métricas en vivo
  const [stats, setStats] = useState({
    vacantesPendientes: 0,
    vacantesActivas: 0,
    postulacionesPendientes: 0,
    postulacionesTurnadas: 0,
    empresasPendientes: 0,
    empresasActivas: 0,
    colocados: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const loadStats = async () => {
    if (!accessToken) return;
    setLoadingStats(true);
    try {
      const [vacs, posts, emps] = await Promise.all([
        fetchAdminVacantes(accessToken, 'todas'),
        fetchAdminPostulaciones(accessToken, 'todas'),
        fetchAdminEmpresas(accessToken, 'todas'),
      ]);

      const vacPend = vacs.filter((v) => v.status === 'pendiente').length;
      const vacAct = vacs.filter((v) => v.status === 'aprobada').length;

      const postPend = posts.filter((p) => p.estado === 'revision_uth').length;
      const postTurn = posts.filter((p) => p.estado === 'enviada_empresa').length;
      const colocadosCount = posts.filter((p) => p.estado === 'Aceptada').length;

      const empPend = emps.filter((e) => e.status === 'pendiente').length;
      const empAct = emps.filter((e) => e.status === 'aprobada').length;

      setStats({
        vacantesPendientes: vacPend,
        vacantesActivas: vacAct,
        postulacionesPendientes: postPend,
        postulacionesTurnadas: postTurn,
        empresasPendientes: empPend,
        empresasActivas: empAct,
        colocados: colocadosCount,
      });
    } catch (err) {
      console.error('Error cargando métricas UTH:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?tipo=admin&redirect=/admin-uth');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (accessToken) {
      loadStats();
    }
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#00A887] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Iniciando consola institucional UTH...</p>
        </div>
      </div>
    );
  }

  if (!user || !accessToken) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner de Bienvenida Institucional */}
      <div className="bg-[#2D2926] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#00A887]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dirección de Vinculación y Extensión Universitaria
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel Institucional · {user.nombres} {user.apellido_paterno}
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Consola operativa para auditoría de ofertas de empleo, filtro de pertinencia de candidatos egresados y validación de empresas vinculadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="http://localhost:8080/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              title="Abrir Django Admin"
            >
              <Database className="w-3.5 h-3.5" />
              Django Admin
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <a
              href="http://localhost:8080/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              title="Abrir Swagger OpenAPI"
            >
              <FileCode className="w-3.5 h-3.5" />
              API Docs
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas en Vivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vacantes por Auditar */}
        <div 
          onClick={() => setActiveTab('vacantes')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeTab === 'vacantes' 
              ? 'border-[#00A887] ring-2 ring-[#00A887]/20 shadow-sm' 
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingStats ? '...' : stats.vacantesPendientes}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#636569]">Vacantes por Auditar</h3>
            <p className="text-[11px] text-[#00A887] font-semibold mt-0.5">
              {stats.vacantesActivas} activas en bolsa pública
            </p>
          </div>
        </div>

        {/* Candidatos por Turnar */}
        <div 
          onClick={() => setActiveTab('postulaciones')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeTab === 'postulaciones' 
              ? 'border-[#691C32] ring-2 ring-[#691C32]/20 shadow-sm' 
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#691C32]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingStats ? '...' : stats.postulacionesPendientes}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#636569]">Filtro de Candidatos</h3>
            <p className="text-[11px] text-[#691C32] font-semibold mt-0.5">
              {stats.postulacionesTurnadas} turnados a empresas
            </p>
          </div>
        </div>

        {/* Empresas por Validar */}
        <div 
          onClick={() => setActiveTab('empresas')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeTab === 'empresas' 
              ? 'border-[#00A887] ring-2 ring-[#00A887]/20 shadow-sm' 
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00A887]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#2D2926]">
              {loadingStats ? '...' : stats.empresasPendientes}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#636569]">Empresas en Convenio</h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {stats.empresasActivas} organizaciones autorizadas
            </p>
          </div>
        </div>

        {/* Colocaciones Universitarias */}
        <div className="p-5 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-purple-700">
              {loadingStats ? '...' : stats.colocados}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#636569]">Colocación UTH</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Egresados contratados en vivo
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas Operativas de la UTH */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('vacantes')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'vacantes'
                  ? 'border-[#00A887] text-[#00A887]'
                  : 'border-transparent text-[#636569] hover:text-[#2D2926]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              1. Auditoría de Vacantes
              {stats.vacantesPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                  {stats.vacantesPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('postulaciones')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'postulaciones'
                  ? 'border-[#691C32] text-[#691C32]'
                  : 'border-transparent text-[#636569] hover:text-[#2D2926]'
              }`}
            >
              <Send className="w-4 h-4" />
              2. Filtro de Candidatos (Turnar a Empresa)
              {stats.postulacionesPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                  {stats.postulacionesPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('empresas')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'empresas'
                  ? 'border-[#00A887] text-[#00A887]'
                  : 'border-transparent text-[#636569] hover:text-[#2D2926]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              3. Validación de Empresas
              {stats.empresasPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {stats.empresasPendientes}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={loadStats}
            className="text-xs text-[#636569] hover:text-[#2D2926] inline-flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualizar métricas
          </button>
        </div>

        {/* Renderizado de Componente Seleccionado */}
        <div>
          {activeTab === 'vacantes' && (
            <VacantesAuditor token={accessToken} onStatsChange={loadStats} />
          )}

          {activeTab === 'postulaciones' && (
            <PostulacionesFiltro token={accessToken} onStatsChange={loadStats} />
          )}

          {activeTab === 'empresas' && (
            <EmpresasValidador token={accessToken} onStatsChange={loadStats} />
          )}
        </div>
      </div>
    </div>
  );
}
