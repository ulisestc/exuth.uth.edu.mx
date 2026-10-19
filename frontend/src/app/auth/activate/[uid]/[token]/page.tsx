'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { activarCuenta } from '@/lib/api';
import { UthLogo } from '@/components/brand/UthLogo';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from 'lucide-react';
import {
  Container,
  Card,
  Checkbox,
  Button,
  ButtonLink,
  Alert,
  Pleca,
} from '@/components/ui';

export default function ActivateAccountPage() {
  const params = useParams<{ uid: string; token: string }>();
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
    <div className="py-16 sm:py-24">
      <Container size="reading">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <UthLogo variant="cuadrado" />
            </div>
            <h1 className="text-display-md text-ink font-semibold tracking-tight">
              Activación de Cuenta
            </h1>
            <p className="text-caption text-ink-64">
              Validación de Correo Electrónico · Bolsa de Trabajo UTH
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
                      Cuenta Activada Exitosamente
                    </h2>
                    <p className="text-caption text-ink-64 leading-relaxed max-w-xs mx-auto">
                      Tu correo ha sido verificado formalmente. Ya puedes iniciar sesión con tus credenciales institucionales.
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
                <form onSubmit={handleActivate} className="space-y-5">
                  <div className="text-center space-y-2">
                    <div className="size-12 rounded-full bg-parchment text-primary flex items-center justify-center mx-auto">
                      <MailCheck className="size-6" />
                    </div>
                    <p className="text-caption text-ink-64 leading-relaxed">
                      Para completar tu registro y activar tu cuenta en la Bolsa de Trabajo UTH, confirma la solicitud a continuación.
                    </p>
                  </div>

                  {errorMsg && (
                    <Alert tone="danger">
                      {errorMsg}
                    </Alert>
                  )}

                  <div className="rounded-card bg-parchment p-4">
                    <Checkbox
                      checked={aceptaAviso}
                      onChange={(e) => setAceptaAviso(e.target.checked)}
                      label={
                        <span>
                          He leído y acepto el{' '}
                          <Link
                            href="/aviso-privacidad"
                            target="_blank"
                            className="font-semibold text-primary hover:underline"
                          >
                            Aviso de Privacidad Institucional
                          </Link>{' '}
                          de la Universidad Tecnológica de Huejotzingo.
                        </span>
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                  >
                    <ShieldCheck className="size-4" />
                    Activar Mi Cuenta
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="text-caption text-ink-64 hover:text-ink font-medium"
                    >
                      ¿Ya habías activado tu cuenta? Iniciar Sesión
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
