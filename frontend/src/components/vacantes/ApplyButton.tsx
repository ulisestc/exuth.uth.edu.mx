'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchMisPostulaciones, crearPostulacion, Postulacion } from '@/lib/api';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface ApplyButtonProps {
  vacanteId: number;
  vacanteTitulo: string;
  empresaNombre?: string;
}

export const ApplyButton: React.FC<ApplyButtonProps> = ({
  vacanteId,
  vacanteTitulo,
  empresaNombre = 'Empresa UTH',
}) => {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isApplied, setIsApplied] = useState(false);
  const [applicationData, setApplicationData] = useState<Postulacion | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if egresado has already applied
  useEffect(() => {
    async function checkExistingApplication() {
      if (authLoading) return;

      if (isAuthenticated && user?.rol === 'egresado' && accessToken) {
        try {
          const misPostulaciones = await fetchMisPostulaciones(accessToken);
          const found = misPostulaciones.find((p) => p.vacante === vacanteId);
          if (found) {
            setIsApplied(true);
            setApplicationData(found);
          }
        } catch (err) {
          console.error('Error checking existing application:', err);
        }
      }
      setIsChecking(false);
    }

    checkExistingApplication();
  }, [authLoading, isAuthenticated, user, accessToken, vacanteId]);

  const handleApply = async () => {
    if (!accessToken) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await crearPostulacion(vacanteId, accessToken);

    setIsSubmitting(false);

    if (result.success && result.data) {
      setIsApplied(true);
      setApplicationData(result.data);
      setShowModal(false);
      setSuccessMsg('¡Postulación enviada exitosamente! Tu información entrará en revisión por el Departamento de Vinculación UTH.');
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al enviar tu postulación.');
    }
  };

  const getEstadoLabel = (estado?: string) => {
    switch (estado) {
      case 'revision_uth':
        return 'En Revisión por UTH';
      case 'enviada_empresa':
        return 'Enviada a Empresa';
      case 'Aceptada':
        return 'Postulación Aceptada';
      case 'Rechazada':
        return 'Proceso Concluido';
      case 'rechazada_uth':
        return 'No cubre perfil UTH';
      default:
        return 'Postulado';
    }
  };

  if (authLoading || isChecking) {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-500 bg-zinc-100 rounded-lg w-full sm:w-auto">
        <Loader2 className="w-4 h-4 animate-spin text-[#00A887]" />
        Verificando estado...
      </div>
    );
  }

  // 1. Caso: Usuario No Autenticado
  if (!isAuthenticated || !user) {
    return (
      <Link
        href={`/login?tipo=egresado&redirect=/vacantes/${vacanteId}`}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all w-full sm:w-auto"
      >
        <Send className="w-4 h-4" />
        Postularme a esta Vacante
      </Link>
    );
  }

  // 2. Caso: Rol Empresa o Administrador
  if (user.rol !== 'egresado') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-600">
        <Lock className="w-3.5 h-3.5 text-zinc-400" />
        Postulación exclusiva para Egresados UTH
      </div>
    );
  }

  // 3. Caso: Egresado Ya Postulado
  if (isApplied) {
    return (
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#00A887]">
          <CheckCircle2 className="w-4 h-4 text-[#00A887]" />
          <span>Postulado · {getEstadoLabel(applicationData?.estado)}</span>
        </div>
        <div>
          <Link
            href="/portal-egresado"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A887] hover:underline"
          >
            Ver estatus en mi portal
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // 4. Caso: Egresado Disponible para Postularse
  return (
    <>
      {successMsg && (
        <div className="mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all w-full sm:w-auto cursor-pointer"
      >
        <Send className="w-4 h-4" />
        Postularme a esta Vacante
      </button>

      {/* Modal Institucional de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden relative">
            {/* Pleca Bicolor */}
            <div className="w-full h-1.5 flex">
              <div className="h-full w-2/3 bg-[#691C32]" />
              <div className="h-full w-1/3 bg-[#C2BA98]" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00A887] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Bolsa de Trabajo UTH
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#2D2926]">
                  Confirmar Postulación Institucional
                </h3>
                <p className="text-xs text-[#636569] mt-1 leading-relaxed">
                  ¿Deseas postularte al puesto de <strong className="text-[#2D2926]">{vacanteTitulo}</strong> en <strong className="text-[#2D2926]">{empresaNombre}</strong>?
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-[#636569] space-y-1">
                <p className="font-semibold text-[#2D2926]">Proceso de Vinculación:</p>
                <p>1. Tu postulación ingresará con estatus <span className="font-semibold text-amber-700">"En Revisión por UTH"</span>.</p>
                <p>2. La coordinación validará que cubras el perfil requerido antes de remitir tus datos a la empresa.</p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-[#A8123E] shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleApply}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Sí, Postularme Ahora
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
