'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { activarCuenta } from '@/lib/api';
import { UthLogo } from '@/components/brand/UthLogo';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  MailCheck
} from 'lucide-react';

export default function ActivateAccountPage() {
  const params = useParams<{ uid: string; token: string }>();
  const router = useRouter();
  const uid = params?.uid || '';
  const token = params?.token || '';

  const [aceptaAviso, setAceptaAviso] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!aceptaAviso) {
      setErrorMsg('Es indispensable aceptar el Aviso de Privacidad para activar tu cuenta institucional.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await activarCuenta({
        uid,
        token,
        acepta_aviso_privacidad: aceptaAviso,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || 'El enlace de activación es inválido o ha expirado.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor al activar la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <UthLogo variant="cuadrado" />
          </div>
          <h1 className="text-2xl font-black text-[#2D2926] tracking-tight">
            Activación de Cuenta
          </h1>
          <p className="text-sm text-[#636569]">
            Validación de Correo Electrónico · Bolsa de Trabajo UTH
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="w-full h-1.5 flex">
            <div className="h-full w-2/3 bg-[#691C32]" />
            <div className="h-full w-1/3 bg-[#C2BA98]" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {success ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00A887] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-[#2D2926]">
                    Cuenta Activada Exitosamente
                  </h2>
                  <p className="text-xs text-[#636569] leading-relaxed">
                    Tu correo ha sido verificado formalmente. Ya puedes iniciar sesión con tus credenciales institucionales para acceder a la plataforma.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg transition-colors cursor-pointer"
                >
                  Ir a Iniciar Sesión
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 text-[#00A887] flex items-center justify-center mx-auto">
                    <MailCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#636569] leading-relaxed">
                    Para completar tu registro y activar tu cuenta en la Bolsa de Trabajo UTH, confirma la solicitud a continuación.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 font-medium">
                    <AlertCircle className="w-4 h-4 text-[#A8123E] shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200/80 space-y-2">
                  <label className="flex items-start gap-2.5 text-xs text-[#2D2926] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceptaAviso}
                      onChange={(e) => setAceptaAviso(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#00A887] focus:ring-[#00A887]"
                    />
                    <span className="leading-tight text-zinc-600">
                      He leído y acepto el{' '}
                      <Link 
                        href="/aviso-privacidad" 
                        target="_blank" 
                        className="font-bold text-[#00A887] hover:underline"
                      >
                        Aviso de Privacidad Institucional
                      </Link>{' '}
                      de la Universidad Tecnológica de Huejotzingo.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] disabled:opacity-60 transition-all cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Activando cuenta...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#C2BA98]" />
                      Activar Mi Cuenta
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-zinc-500 hover:text-[#2D2926]"
                  >
                    ¿Ya habías activado tu cuenta? Iniciar Sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
