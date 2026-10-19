'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { confirmarResetPassword } from '@/lib/api';
import { UthLogo } from '@/components/brand/UthLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  Container,
  Card,
  Field,
  Input,
  Button,
  ButtonLink,
  Alert,
  Pleca,
} from '@/components/ui';

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
    <div className="py-16 sm:py-24">
      <Container size="reading">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <UthLogo variant="cuadrado" />
            </div>
            <h1 className="text-display-md text-ink font-semibold tracking-tight">
              Nueva Contraseña
            </h1>
            <p className="text-caption text-ink-64">
              Recuperación de Acceso · Bolsa de Trabajo UTH
            </p>
          </div>

          <Card className="p-0 overflow-hidden bg-canvas">
            <Pleca />

            <div className="p-6 sm:p-8 space-y-6">
              {success ? (
                <div className="text-center space-y-5 py-4">
                  <div className="size-12 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-tagline text-ink font-semibold">
                      Contraseña Restablecida
                    </h2>
                    <p className="text-caption text-ink-64 leading-relaxed max-w-xs mx-auto">
                      Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva credencial.
                    </p>
                  </div>
                  <ButtonLink
                    href="/login"
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    Ir a Iniciar Sesión
                    <ArrowRight className="size-4" />
                  </ButtonLink>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <Alert tone="danger">
                      {errorMsg}
                    </Alert>
                  )}

                  <Field label="Nueva Contraseña" required hint="Mínimo 8 caracteres">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        leading={<Lock className="size-4" />}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-64 hover:text-ink cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar Nueva Contraseña" required>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={reNewPassword}
                        onChange={(e) => setReNewPassword(e.target.value)}
                        placeholder="••••••••"
                        leading={<Lock className="size-4" />}
                        className="pr-10"
                      />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                  >
                    Guardar Nueva Contraseña
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
