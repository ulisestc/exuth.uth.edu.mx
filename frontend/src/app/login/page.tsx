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
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import {
  Container,
  Card,
  Field,
  Input,
  Checkbox,
  Button,
  ButtonLink,
  Modal,
  Alert,
  PageLoader,
} from '@/components/ui';

function LoginFormContent() {
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
        const dest = getRoleRedirectPath(result.user.rol, returnUrl);
        router.push(dest);
      } else {
        setErrorMsg(result.error || 'Credenciales incorrectas o cuenta inactiva.');
      }
    } catch {
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
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <Container size="reading">
        <div className="max-w-md mx-auto space-y-6">
          {/* Cabecera con Logotipo UTH */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <UthLogo variant="cuadrado" imgClassName="h-20 w-auto" />
            </div>
            <h1 className="text-display-md text-ink font-semibold">Iniciar Sesión</h1>
            <p className="text-caption text-ink-64">
              Acceso unificado para Egresados, Empresas y Personal UTH.
            </p>
          </div>

          {/* Tarjeta del Formulario */}
          <Card padded className="space-y-6 bg-canvas">
            {errorMsg && (
              <Alert tone="danger" title="Error de autenticación">
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Correo Electrónico" required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. usuario@uth.edu.mx o contacto@empresa.com"
                  leading={<Mail className="size-4" />}
                />
              </Field>

              <Field
                label={
                  <div className="flex items-center justify-between w-full">
                    <span>Contraseña</span>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetError(null);
                        setResetSuccess(false);
                        setShowResetModal(true);
                      }}
                      className="text-fine text-primary hover:underline font-normal cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                }
                required
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    leading={<Lock className="size-4" />}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="press absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-64 hover:text-ink focus:outline-none"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <div className="pt-1">
                <Checkbox
                  label="Recordar mi sesión en este dispositivo"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  iconRight={<ArrowRight className="size-4" />}
                >
                  Acceder al Portal
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-divider text-center text-caption text-ink-64">
              <span>¿No tienes una cuenta? </span>
              <Link href="/registro" className="text-primary font-semibold hover:underline">
                Crear una cuenta
              </Link>
            </div>
          </Card>
        </div>
      </Container>

      {/* Modal de Recuperación de Contraseña */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Recuperar Contraseña"
        description="Ingresa tu correo electrónico registrado y te enviaremos las instrucciones de restablecimiento."
        footer={
          resetSuccess ? (
            <Button variant="primary" size="sm" onClick={() => setShowResetModal(false)}>
              Entendido
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isResetting}
                onClick={handleResetPassword}
              >
                Enviar Instrucciones
              </Button>
            </div>
          )
        }
      >
        {resetSuccess ? (
          <Alert tone="success" title="Correo enviado">
            Revisa tu bandeja de entrada en <strong>{resetEmail}</strong> para completar el cambio de contraseña.
          </Alert>
        ) : (
          <div className="space-y-4">
            {resetError && <Alert tone="danger">{resetError}</Alert>}
            <Field label="Correo Electrónico Registrado" required>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="tu.correo@uth.edu.mx"
                leading={<Mail className="size-4" />}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Cargando acceso…" />}>
      <LoginFormContent />
    </Suspense>
  );
}
