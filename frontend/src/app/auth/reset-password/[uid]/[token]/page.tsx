'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { confirmarResetPassword } from '@/lib/api';
import { UthLogo } from '@/components/brand/UthLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function ResetPasswordConfirmPage() {
  const params = useParams<{ uid: string; token: string }>();
  const uid = params?.uid || '';
  const token = params?.token || '';

  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== reNewPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmarResetPassword({
        uid,
        token,
        new_password: newPassword,
        re_new_password: reNewPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'El enlace ha expirado o no es válido.');
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
            Asignar Nueva Contraseña
          </h1>
          <p className="text-sm text-[#636569]">
            Recuperación de Acceso · Bolsa de Trabajo UTH
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="w-full h-1.5 flex">
            <div className="h-full w-2/3 bg-[#691C32]" />
            <div className="h-full w-1/3 bg-[#C2BA98]" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00A887] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-[#2D2926]">
                    Contraseña Restablecida
                  </h2>
                  <p className="text-xs text-[#636569] leading-relaxed">
                    Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva credencial.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg transition-colors"
                >
                  Ir a Iniciar Sesión
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 font-medium">
                    <AlertCircle className="w-4 h-4 text-[#A8123E] shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={reNewPassword}
                      onChange={(e) => setReNewPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando contraseña...
                    </>
                  ) : (
                    'Guardar Nueva Contraseña'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
