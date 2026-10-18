'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath } from '@/lib/auth';
import { solicitarResetPassword } from '@/lib/api';
import { UthLogo } from '@/components/brand/UthLogo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  X,
  KeyRound
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('redirect');

  const { login, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de recuperación de contraseña
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const destination = getRoleRedirectPath(user.rol, returnUrl);
      router.push(destination);
    }
  }, [isAuthenticated, user, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email: email.trim(), password });

      if (result.success && result.user) {
        // Redirección inteligente según el rol
        const dest = getRoleRedirectPath(result.user.rol, returnUrl);
        router.push(dest);
      } else {
        setErrorMsg(result.error || 'Credenciales incorrectas o cuenta inactiva.');
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión con el servidor de autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetEmail.trim()) {
      setResetError('Ingresa tu correo electrónico registrado.');
      return;
    }
    setIsResetting(true);
    try {
      await solicitarResetPassword(resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'No fue posible procesar la solicitud.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Cabecera con imagotipo oficial */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <UthLogo variant="cuadrado" />
          </div>
          <h1 className="text-2xl font-black text-[#2D2926] tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-[#636569]">
            Bolsa de Trabajo Institucional · Acceso Unificado (Egresados, Empresas y Personal UTH)
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          {/* Pleca Bicolor Superior */}
          <div className="w-full h-1.5 flex">
            <div className="h-full w-2/3 bg-[#691C32]" />
            <div className="h-full w-1/3 bg-[#C2BA98]" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-[#A8123E] shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Correo Electrónico */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5"
                >
                  Correo Electrónico
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. usuario@uth.edu.mx o contacto@empresa.com"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] focus:border-[#00A887] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="password" 
                    className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetError(null);
                      setResetSuccess(false);
                      setShowResetModal(true);
                    }}
                    className="text-xs text-[#00A887] hover:text-[#008F73] font-medium hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] focus:border-[#00A887] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox Recordarme */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#00A887] focus:ring-[#00A887] border-zinc-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#636569] cursor-pointer">
                  Mantener sesión iniciada en este dispositivo
                </label>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00A887] hover:bg-[#008F73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A887] disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Autenticando en servidor UTH...
                  </>
                ) : (
                  <>
                    Acceder al Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Enlace al Registro */}
            <div className="pt-2 text-center text-xs text-[#636569] border-t border-zinc-100">
              ¿Aún no tienes cuenta institucional?{' '}
              <Link 
                href="/registro" 
                className="font-bold text-[#00A887] hover:text-[#008F73] hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Nota legal al pie */}
        <p className="text-center text-[11px] text-zinc-400">
          Universidad Tecnológica de Huejotzingo · Organismo Público Descentralizado del Gobierno del Estado de Puebla
        </p>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00A887]" />
                <h3 className="text-sm font-bold text-[#2D2926]">Restablecer Contraseña</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {resetSuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00A887] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#2D2926]">Enlace enviado</h4>
                    <p className="text-xs text-[#636569] leading-relaxed">
                      Si el correo <strong className="text-[#2D2926]">{resetEmail}</strong> está registrado en el sistema, recibirás un correo con el enlace seguro para restablecer tu contraseña.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-full py-2.5 bg-[#00A887] hover:bg-[#008F73] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-[#636569] leading-relaxed">
                    Ingresa el correo electrónico asociado a tu cuenta (Egresado, Empresa o Personal UTH) y te enviaremos un enlace temporal para asignar una nueva contraseña.
                  </p>

                  {resetError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {resetError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                      Correo Registrado
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar enlace de recuperación'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00A887] animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
