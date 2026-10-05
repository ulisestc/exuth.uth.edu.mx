'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirectPath, UserRole } from '@/lib/auth';
import { UthLogo } from '@/components/brand/UthLogo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('redirect');
  const roleParam = searchParams.get('tipo');

  const { login, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'egresado' | 'empresa' | 'admin'>(
    roleParam === 'empresa' ? 'empresa' : roleParam === 'admin' ? 'admin' : 'egresado'
  );

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

  const handleQuickFill = (testEmail: string, testPass: string, tab: 'egresado' | 'empresa' | 'admin') => {
    setEmail(testEmail);
    setPassword(testPass);
    setActiveTab(tab);
    setErrorMsg(null);
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
            Bolsa de Trabajo Institucional · Acceso Unificado
          </p>
        </div>

        {/* Selector de Pestaña Institucional */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('egresado')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md transition-all ${
              activeTab === 'egresado'
                ? 'bg-white text-[#00A887] shadow-sm font-bold'
                : 'text-[#636569] hover:text-[#2D2926]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Egresados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('empresa')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md transition-all ${
              activeTab === 'empresa'
                ? 'bg-white text-[#691C32] shadow-sm font-bold'
                : 'text-[#636569] hover:text-[#2D2926]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Empresas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-[#2D2926] shadow-sm font-bold'
                : 'text-[#636569] hover:text-[#2D2926]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Vinculación
          </button>
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
                  {activeTab === 'egresado' 
                    ? 'Correo Institucional o Personal' 
                    : activeTab === 'empresa'
                    ? 'Correo de Contacto Empresarial'
                    : 'Correo Administrativo UTH'}
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
                    placeholder={
                      activeTab === 'egresado' 
                        ? 'ej. egresado@uth.edu.mx' 
                        : activeTab === 'empresa' 
                        ? 'ej. contacto@empresa.com' 
                        : 'ej. vinculacion@uth.edu.mx'
                    }
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
                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Para restablecer tu contraseña, contacta al Departamento de Vinculación UTH o usa el enlace enviado a tu correo institucional.');
                    }}
                    className="text-xs text-[#00A887] hover:text-[#008F73] font-medium hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
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

        {/* Acceso Rápido de Prueba (Development Helper) */}
        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
          <p className="text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A887]" />
            Cuentas de demostración (1 clic para llenar):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('egresado@uth.edu.mx', 'Egresado2026!', 'egresado')}
              className="text-left p-2 rounded-md bg-white border border-zinc-200 hover:border-[#00A887] hover:bg-emerald-50/40 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-[#00A887] group-hover:underline">
                🎓 Egresado
              </div>
              <div className="text-[10px] text-zinc-500 truncate">egresado@uth.edu.mx</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('contacto@autoteam.com', 'Empresa2026!', 'empresa')}
              className="text-left p-2 rounded-md bg-white border border-zinc-200 hover:border-[#691C32] hover:bg-rose-50/40 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-[#691C32] group-hover:underline">
                🏢 Empresa
              </div>
              <div className="text-[10px] text-zinc-500 truncate">contacto@autoteam.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('johanyuri24@gmail.com', 'Admin2026!', 'admin')}
              className="text-left p-2 rounded-md bg-white border border-zinc-200 hover:border-zinc-800 hover:bg-zinc-100 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-[#2D2926] group-hover:underline">
                🏛️ Admin UTH
              </div>
              <div className="text-[10px] text-zinc-500 truncate">johanyuri24@gmail.com</div>
            </button>
          </div>
        </div>

        {/* Nota legal al pie */}
        <p className="text-center text-[11px] text-zinc-400">
          Universidad Tecnológica de Huejotzingo · Organismo Público Descentralizado del Gobierno del Estado de Puebla
        </p>
      </div>
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
