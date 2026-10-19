'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCarreras,
  fetchGiros,
  fetchSectores,
  Carrera,
  Giro,
  Sector,
} from '@/lib/api';
import { registerEgresado, registerEmpresa } from '@/lib/auth';
import { UthLogo } from '@/components/brand/UthLogo';
import {
  GraduationCap,
  Building2,
  Lock,
  Eye,
  EyeOff,
  User,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from 'lucide-react';
import {
  Container,
  Card,
  Field,
  Input,
  Select,
  Checkbox,
  Button,
  ButtonLink,
  Alert,
  Pleca,
  SegmentedTabs,
  PageLoader,
} from '@/components/ui';

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo');

  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'egresado' | 'empresa'>(
    tipoParam === 'empresa' ? 'empresa' : 'egresado'
  );

  // Catálogos desde la API
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [giros, setGiros] = useState<Giro[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Estados comunes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Campos Egresado
  const [egresadoForm, setEgresadoForm] = useState({
    matricula: '',
    curp: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    carrera: '',
    nivel_estudios: 'ING_LIC' as 'TSU' | 'ING_LIC' | 'MTRIA',
    genero: 'M' as 'M' | 'F' | 'O',
    telefono_celular: '',
    domicilio: '',
    habilidades: '',
    email: '',
    password: '',
    confirmPassword: '',
    acepta_aviso_privacidad: false,
  });

  // Campos Empresa
  const [empresaForm, setEmpresaForm] = useState({
    nombre: '',
    rfc: '',
    domicilio: '',
    correo_contacto: '',
    actividad_de_la_empresa: '',
    giro: '',
    sector: '',
    nombre_contacto: '',
    cargo_contacto: '',
    telefono_oficina: '',
    telefono_celular: '',
    email: '',
    password: '',
    confirmPassword: '',
    acepta_aviso_privacidad: false,
  });

  // Cargar catálogos
  useEffect(() => {
    async function loadData() {
      try {
        const [carrerasData, girosData, sectoresData] = await Promise.all([
          fetchCarreras(),
          fetchGiros(),
          fetchSectores(),
        ]);
        setCarreras(carrerasData);
        setGiros(girosData);
        setSectores(sectoresData);

        if (carrerasData.length > 0) {
          setEgresadoForm((prev) => ({ ...prev, carrera: String(carrerasData[0].id) }));
        }
        if (girosData.length > 0) {
          setEmpresaForm((prev) => ({ ...prev, giro: String(girosData[0].id) }));
        }
        if (sectoresData.length > 0) {
          setEmpresaForm((prev) => ({ ...prev, sector: String(sectoresData[0].id) }));
        }
      } catch (err) {
        console.error('Error loading catalogs:', err);
      } finally {
        setLoadingCatalogs(false);
      }
    }
    loadData();
  }, []);

  // Redireccionar si ya está logueado
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === 'egresado') router.push('/portal-egresado');
      else if (user.rol === 'empresa') router.push('/portal-empresa');
      else router.push('/admin-uth');
    }
  }, [isAuthenticated, user, router]);

  // Submit Egresado
  const handleSubmitEgresado = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (egresadoForm.password !== egresadoForm.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (egresadoForm.password.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    if (egresadoForm.curp.length !== 18) {
      setErrorMsg('La CURP debe tener exactamente 18 caracteres alfanuméricos.');
      return;
    }

    if (!egresadoForm.acepta_aviso_privacidad) {
      setErrorMsg('Es indispensable aceptar el Aviso de Privacidad Institucional para crear tu cuenta.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerEgresado({
        matricula: egresadoForm.matricula,
        curp: egresadoForm.curp,
        nombres: egresadoForm.nombres,
        apellido_paterno: egresadoForm.apellido_paterno,
        apellido_materno: egresadoForm.apellido_materno,
        carrera: Number(egresadoForm.carrera),
        nivel_estudios: egresadoForm.nivel_estudios,
        genero: egresadoForm.genero,
        telefono_celular: egresadoForm.telefono_celular,
        domicilio: egresadoForm.domicilio,
        habilidades: egresadoForm.habilidades || 'Competencias de formación profesional UTH',
        email: egresadoForm.email,
        password: egresadoForm.password,
        acepta_aviso_privacidad: true,
      });

      if (result.success) {
        if (result.requiresActivation) {
          setRegisteredEmail(egresadoForm.email);
        } else {
          router.push('/portal-egresado');
        }
      } else {
        setErrorMsg(result.error || 'No se pudo completar el registro de egresado.');
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Empresa
  const handleSubmitEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (empresaForm.password !== empresaForm.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (empresaForm.password.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    if (!empresaForm.acepta_aviso_privacidad) {
      setErrorMsg('Es indispensable aceptar el Aviso de Privacidad Institucional para registrar tu empresa.');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactoPartes = empresaForm.nombre_contacto.trim().split(' ');
      const nombres = contactoPartes[0] || 'Contacto';
      const apellido_paterno = contactoPartes[1] || 'Empresa';
      const apellido_materno = contactoPartes.slice(2).join(' ') || '.';

      const result = await registerEmpresa({
        nombre: empresaForm.nombre,
        domicilio: empresaForm.domicilio,
        correo_contacto: empresaForm.correo_contacto || empresaForm.email,
        actividad_de_la_empresa: empresaForm.actividad_de_la_empresa,
        giro: Number(empresaForm.giro),
        sector: Number(empresaForm.sector),
        nombre_contacto: empresaForm.nombre_contacto,
        cargo_contacto: empresaForm.cargo_contacto,
        telefono_oficina: empresaForm.telefono_oficina,
        telefono_celular: empresaForm.telefono_celular,
        nombres,
        apellido_paterno,
        apellido_materno,
        email: empresaForm.email,
        password: empresaForm.password,
        acepta_aviso_privacidad: true,
      });

      if (result.success) {
        if (result.requiresActivation) {
          setRegisteredEmail(empresaForm.email);
        } else {
          router.push('/portal-empresa');
        }
      } else {
        setErrorMsg(result.error || 'No se pudo completar el registro empresarial.');
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="py-16 sm:py-24">
        <Container size="reading">
          <div className="mx-auto max-w-md space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-2">
                <UthLogo variant="cuadrado" />
              </div>
              <h1 className="text-display-md text-ink font-semibold tracking-tight">
                Verifica tu Correo
              </h1>
              <p className="text-caption text-ink-64">
                Bolsa de Trabajo y Seguimiento de Egresados · UTH
              </p>
            </div>

            <Card className="p-0 overflow-hidden bg-canvas shadow-subtle border border-divider">
              <Pleca />

              <div className="p-6 sm:p-8 space-y-6 text-center">
                <div className="size-14 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto">
                  <MailCheck className="size-7" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-tagline text-ink font-semibold">
                    ¡Cuenta creada exitosamente!
                  </h2>
                  <p className="text-caption text-ink-64 leading-relaxed">
                    Hemos enviado un enlace de activación institucional a tu correo electrónico:
                  </p>
                  <p className="text-body-strong text-ink font-mono bg-canvas-subtle py-2 px-3 rounded-lg border border-divider break-all">
                    {registeredEmail}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-canvas-subtle border border-divider text-left space-y-2 text-caption text-ink-64">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Por seguridad institucional, pulsa en el botón <strong>Activar Mi Cuenta Institucional</strong> que te enviamos para comenzar a utilizar la plataforma.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ink-48 pl-6">
                    • Si no lo ves en tu bandeja principal, revisa la carpeta de <strong>Correo no deseado (Spam)</strong>.
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <ButtonLink href="/login" variant="primary" size="md" fullWidth>
                    Ir a Iniciar Sesión <ArrowRight className="size-4 ml-1.5" />
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setRegisteredEmail(null);
                      setErrorMsg(null);
                    }}
                  >
                    Registrar otra cuenta
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <Container size="reading">
        {/* Cabecera institucional */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center mb-2">
            <UthLogo variant="cuadrado" />
          </div>
          <h1 className="text-display-md text-ink font-semibold tracking-tight">
            Registro Institucional
          </h1>
          <p className="text-body text-ink-64">
            Bolsa de Trabajo y Vinculación Laboral · Universidad Tecnológica de Huejotzingo
          </p>
        </div>

        {/* Selector de Perfil SegmentedTabs */}
        <div className="flex justify-center mb-6">
          <SegmentedTabs
            items={[
              { id: 'egresado', label: 'Soy Egresado(a) UTH', icon: GraduationCap },
              { id: 'empresa', label: 'Soy Empresa / Empleador', icon: Building2 },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as 'egresado' | 'empresa');
              setErrorMsg(null);
            }}
          />
        </div>

        {/* Tarjeta del Formulario */}
        <Card className="p-0 overflow-hidden bg-canvas">
          <Pleca />

          <div className="p-6 sm:p-10 space-y-8">
            {/* Mensaje de Error */}
            {errorMsg && (
              <Alert tone="danger">
                {errorMsg}
              </Alert>
            )}

            {/* FORMULARIO EGRESADO */}
            {activeTab === 'egresado' ? (
              <form onSubmit={handleSubmitEgresado} className="space-y-8">
                {/* 1. Datos Personales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <User className="size-4 text-primary" />
                    <h2 className="text-tagline text-ink font-semibold">
                      1. Identidad y Datos Personales
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Matrícula UTH" required>
                      <Input
                        required
                        value={egresadoForm.matricula}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, matricula: e.target.value })}
                        placeholder="ej. 202303045"
                      />
                    </Field>

                    <Field label="CURP (18 caracteres)" required>
                      <Input
                        required
                        maxLength={18}
                        value={egresadoForm.curp}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, curp: e.target.value.toUpperCase() })}
                        placeholder="ej. SAPA010101MPLRRN01"
                        className="uppercase font-mono"
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Nombre(s)" required>
                        <Input
                          required
                          value={egresadoForm.nombres}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, nombres: e.target.value })}
                          placeholder="Nombre(s) completo(s)"
                        />
                      </Field>
                    </div>

                    <Field label="Primer apellido" required>
                      <Input
                        required
                        value={egresadoForm.apellido_paterno}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, apellido_paterno: e.target.value })}
                        placeholder="Apellido paterno"
                      />
                    </Field>

                    <Field label="Segundo apellido" required>
                      <Input
                        required
                        value={egresadoForm.apellido_materno}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, apellido_materno: e.target.value })}
                        placeholder="Apellido materno"
                      />
                    </Field>

                    <Field label="Género" required>
                      <Select
                        value={egresadoForm.genero}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, genero: e.target.value as 'M' | 'F' | 'O' })}
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </Select>
                    </Field>

                    <Field label="Teléfono Celular" required>
                      <Input
                        type="tel"
                        required
                        value={egresadoForm.telefono_celular}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, telefono_celular: e.target.value })}
                        placeholder="ej. 2221234567"
                      />
                    </Field>
                  </div>
                </div>

                {/* 2. Datos Académicos */}
                <div className="space-y-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <BookOpen className="size-4 text-primary" />
                    <h2 className="text-tagline text-ink font-semibold">
                      2. Formación Académica y Residencia
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nivel de Estudios" required>
                      <Select
                        value={egresadoForm.nivel_estudios}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, nivel_estudios: e.target.value as any })}
                      >
                        <option value="ING_LIC">Ingeniería / Licenciatura</option>
                        <option value="TSU">Técnico Superior Universitario (TSU)</option>
                        <option value="MTRIA">Maestría</option>
                      </Select>
                    </Field>

                    <Field label="Programa Educativo / Carrera UTH" required>
                      <Select
                        required
                        disabled={loadingCatalogs}
                        value={egresadoForm.carrera}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, carrera: e.target.value })}
                      >
                        {carreras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Domicilio de Residencia (Municipio, Estado)" required>
                        <Input
                          required
                          value={egresadoForm.domicilio}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, domicilio: e.target.value })}
                          placeholder="ej. Calle 5 de Mayo #12, Santa Ana Xalmimilulco, Huejotzingo, Pue."
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Habilidades y Competencias Principales" optional>
                        <Input
                          value={egresadoForm.habilidades}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, habilidades: e.target.value })}
                          placeholder="ej. Python, PLC Siemens, SolidWorks, Redes Cisco, Inglés B2"
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* 3. Seguridad de Acceso */}
                <div className="space-y-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <Lock className="size-4 text-primary" />
                    <h2 className="text-tagline text-ink font-semibold">
                      3. Cuenta y Acceso
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Correo Electrónico (Institucional o personal)" required>
                        <Input
                          type="email"
                          required
                          value={egresadoForm.email}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, email: e.target.value })}
                          placeholder="ej. tu_correo@uth.edu.mx"
                        />
                      </Field>
                    </div>

                    <Field label="Contraseña (mínimo 8 caracteres)" required>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={egresadoForm.password}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, password: e.target.value })}
                          placeholder="••••••••"
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

                    <Field label="Confirmar Contraseña" required>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={egresadoForm.confirmPassword}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-64 hover:text-ink cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Aviso de Privacidad */}
                <div className="rounded-card bg-parchment p-4">
                  <Checkbox
                    checked={egresadoForm.acepta_aviso_privacidad}
                    onChange={(e) => setEgresadoForm({ ...egresadoForm, acepta_aviso_privacidad: e.target.checked })}
                    label={
                      <span>
                        Acepto el{' '}
                        <Link href="/aviso-privacidad" target="_blank" className="font-semibold text-primary hover:underline">
                          Aviso de Privacidad Institucional
                        </Link>{' '}
                        de la Universidad Tecnológica de Huejotzingo para el resguardo y vinculación laboral.
                      </span>
                    }
                  />
                </div>

                {/* Botón Acción Principal */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                >
                  Crear mi cuenta de egresado UTH
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : (
              /* FORMULARIO EMPRESA */
              <form onSubmit={handleSubmitEmpresa} className="space-y-8">
                {/* 1. Datos Empresa */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <Building2 className="size-4 text-wine" />
                    <h2 className="text-tagline text-ink font-semibold">
                      1. Datos de la Organización
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Razón Social o Nombre Comercial" required>
                        <Input
                          required
                          value={empresaForm.nombre}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })}
                          placeholder="ej. AutoTech Solutions Puebla S.A. de C.V."
                        />
                      </Field>
                    </div>

                    <Field label="RFC de la Empresa" required>
                      <Input
                        required
                        value={empresaForm.rfc}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, rfc: e.target.value.toUpperCase() })}
                        placeholder="ej. ASP200101ABC"
                        className="uppercase font-mono"
                      />
                    </Field>

                    <Field label="Sector" required>
                      <Select
                        required
                        disabled={loadingCatalogs}
                        value={empresaForm.sector}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, sector: e.target.value })}
                      >
                        {sectores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Giro Empresarial" required>
                      <Select
                        required
                        disabled={loadingCatalogs}
                        value={empresaForm.giro}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, giro: e.target.value })}
                      >
                        {giros.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Teléfono de Oficina" optional>
                      <Input
                        type="tel"
                        value={empresaForm.telefono_oficina}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, telefono_oficina: e.target.value })}
                        placeholder="ej. 2222759000"
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Domicilio Corporativo o Planta" required>
                        <Input
                          required
                          value={empresaForm.domicilio}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, domicilio: e.target.value })}
                          placeholder="ej. Corredor Industrial Huejotzingo Nave 4, Puebla"
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Actividad Principal o Ramo" required>
                        <Input
                          required
                          value={empresaForm.actividad_de_la_empresa}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, actividad_de_la_empresa: e.target.value })}
                          placeholder="ej. Manufactura de arneses automotrices y software embebido"
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* 2. Contacto RH */}
                <div className="space-y-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <User className="size-4 text-wine" />
                    <h2 className="text-tagline text-ink font-semibold">
                      2. Enlace de Recursos Humanos
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombre del Contacto" required>
                      <Input
                        required
                        value={empresaForm.nombre_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_contacto: e.target.value })}
                        placeholder="ej. Lic. Laura Flores"
                      />
                    </Field>

                    <Field label="Cargo en la Empresa" required>
                      <Input
                        required
                        value={empresaForm.cargo_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, cargo_contacto: e.target.value })}
                        placeholder="ej. Coordinadora de Reclutamiento"
                      />
                    </Field>

                    <Field label="Correo de Contacto RH" required>
                      <Input
                        type="email"
                        required
                        value={empresaForm.correo_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, correo_contacto: e.target.value })}
                        placeholder="ej. talento@empresa.com"
                      />
                    </Field>

                    <Field label="Teléfono Celular" optional>
                      <Input
                        type="tel"
                        value={empresaForm.telefono_celular}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, telefono_celular: e.target.value })}
                        placeholder="ej. 2223456789"
                      />
                    </Field>
                  </div>
                </div>

                {/* 3. Acceso Cuenta */}
                <div className="space-y-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <Lock className="size-4 text-wine" />
                    <h2 className="text-tagline text-ink font-semibold">
                      3. Cuenta y Acceso
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Correo Electrónico (Inicio de sesión)" required>
                        <Input
                          type="email"
                          required
                          value={empresaForm.email}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                          placeholder="ej. contacto@empresa.com"
                        />
                      </Field>
                    </div>

                    <Field label="Contraseña (mínimo 8 caracteres)" required>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={empresaForm.password}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, password: e.target.value })}
                          placeholder="••••••••"
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

                    <Field label="Confirmar Contraseña" required>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={empresaForm.confirmPassword}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-64 hover:text-ink cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Aviso de Privacidad */}
                <div className="rounded-card bg-parchment p-4">
                  <Checkbox
                    checked={empresaForm.acepta_aviso_privacidad}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, acepta_aviso_privacidad: e.target.checked })}
                    label={
                      <span>
                        Acepto el{' '}
                        <Link href="/aviso-privacidad" target="_blank" className="font-semibold text-primary hover:underline">
                          Aviso de Privacidad Institucional
                        </Link>{' '}
                        y el compromiso de tratamiento responsable de las postulaciones de egresados de la UTH.
                      </span>
                    }
                  />
                </div>

                {/* Botón Acción Principal */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                >
                  Registrar empresa en Bolsa UTH
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}

            {/* Enlace al Login */}
            <div className="pt-4 text-center text-caption text-ink-64 border-t border-hairline">
              ¿Ya tienes cuenta en la Bolsa de Trabajo UTH?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </Card>

        {/* Nota legal al pie */}
        <p className="mt-8 text-center text-fine text-ink-48">
          Universidad Tecnológica de Huejotzingo · Organismo Público Descentralizado del Gobierno del Estado de Puebla
        </p>
      </Container>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<PageLoader label="Cargando formulario de registro…" />}>
      <RegistroForm />
    </Suspense>
  );
}
