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
  Sector 
} from '@/lib/api';
import { registerEgresado, registerEmpresa } from '@/lib/auth';
import { UthLogo } from '@/components/brand/UthLogo';
import { 
  GraduationCap, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  BookOpen,
  Briefcase
} from 'lucide-react';

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
        router.push('/portal-egresado');
      } else {
        setErrorMsg(result.error || 'No se pudo completar el registro de egresado.');
      }
    } catch (err: any) {
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
      // Usar el nombre de contacto para nombres y apellidos
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
        router.push('/portal-empresa');
      } else {
        setErrorMsg(result.error || 'No se pudo completar el registro empresarial.');
      }
    } catch (err: any) {
      setErrorMsg('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Cabecera con imagotipo oficial */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <UthLogo variant="cuadrado" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D2926] tracking-tight">
            Registro Institucional
          </h1>
          <p className="text-sm text-[#636569]">
            Bolsa de Trabajo y Vinculación Laboral · Universidad Tecnológica de Huejotzingo
          </p>
        </div>

        {/* Selector de Pestaña */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('egresado');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === 'egresado'
                ? 'bg-white text-[#00A887] shadow-sm font-black'
                : 'text-[#636569] hover:text-[#2D2926]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Soy Egresado(a) UTH
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('empresa');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === 'empresa'
                ? 'bg-white text-[#691C32] shadow-sm font-black'
                : 'text-[#636569] hover:text-[#2D2926]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Soy Empresa / Empleador
          </button>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          {/* Pleca Bicolor */}
          <div className="w-full h-1.5 flex">
            <div className="h-full w-2/3 bg-[#691C32]" />
            <div className="h-full w-1/3 bg-[#C2BA98]" />
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-[#A8123E] shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* FORMULARIO EGRESADO */}
            {activeTab === 'egresado' ? (
              <form onSubmit={handleSubmitEgresado} className="space-y-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#00A887] flex items-center gap-2 mb-4">
                    <User className="w-4 h-4" />
                    1. Datos Personales y de Identidad
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Matrícula UTH *
                      </label>
                      <input
                        type="text"
                        required
                        value={egresadoForm.matricula}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, matricula: e.target.value })}
                        placeholder="ej. 202303045"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        CURP (18 dígitos) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        value={egresadoForm.curp}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, curp: e.target.value.toUpperCase() })}
                        placeholder="ej. SAPA010101MPLRRN01"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 uppercase focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Nombre(s) *
                      </label>
                      <input
                        type="text"
                        required
                        value={egresadoForm.nombres}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, nombres: e.target.value })}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Apellido Paterno *
                      </label>
                      <input
                        type="text"
                        required
                        value={egresadoForm.apellido_paterno}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, apellido_paterno: e.target.value })}
                        placeholder="Primer apellido"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Apellido Materno *
                      </label>
                      <input
                        type="text"
                        required
                        value={egresadoForm.apellido_materno}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, apellido_materno: e.target.value })}
                        placeholder="Segundo apellido"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Género *
                      </label>
                      <select
                        value={egresadoForm.genero}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, genero: e.target.value as 'M' | 'F' | 'O' })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] bg-white"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Teléfono Celular *
                      </label>
                      <input
                        type="tel"
                        required
                        value={egresadoForm.telefono_celular}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, telefono_celular: e.target.value })}
                        placeholder="ej. 2221234567"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#00A887] flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4" />
                    2. Datos Académicos y Domicilio
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Nivel de Estudios *
                      </label>
                      <select
                        value={egresadoForm.nivel_estudios}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, nivel_estudios: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] bg-white"
                      >
                        <option value="ING_LIC">Ingeniería / Licenciatura</option>
                        <option value="TSU">Técnico Superior Universitario (TSU)</option>
                        <option value="MTRIA">Maestría</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Programa / Carrera UTH *
                      </label>
                      <select
                        required
                        disabled={loadingCatalogs}
                        value={egresadoForm.carrera}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, carrera: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887] bg-white"
                      >
                        {carreras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Domicilio Completo (Municipio, Estado) *
                      </label>
                      <input
                        type="text"
                        required
                        value={egresadoForm.domicilio}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, domicilio: e.target.value })}
                        placeholder="ej. Calle 5 de Mayo #12, Santa Ana Xalmimilulco, Huejotzingo, Pue."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Habilidades y Competencias Principales (Opcional)
                      </label>
                      <input
                        type="text"
                        value={egresadoForm.habilidades}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, habilidades: e.target.value })}
                        placeholder="ej. Java, Python, PLC, Mantenimiento Eléctrico, Trabajo en equipo"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#00A887] flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4" />
                    3. Cuenta y Seguridad
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Correo Electrónico (Acceso institucional o personal) *
                      </label>
                      <input
                        type="email"
                        required
                        value={egresadoForm.email}
                        onChange={(e) => setEgresadoForm({ ...egresadoForm, email: e.target.value })}
                        placeholder="ej. tu_correo@uth.edu.mx"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Contraseña (mínimo 8 caracteres) *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={egresadoForm.password}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={egresadoForm.confirmPassword}
                          onChange={(e) => setEgresadoForm({ ...egresadoForm, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aviso de Privacidad Obligatorio */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={egresadoForm.acepta_aviso_privacidad}
                      onChange={(e) => setEgresadoForm({ ...egresadoForm, acepta_aviso_privacidad: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#00A887] focus:ring-[#00A887]"
                    />
                    <span className="text-xs text-[#636569] leading-relaxed">
                      Acepto el <Link href="/aviso-privacidad" target="_blank" className="font-bold text-[#00A887] hover:underline">Aviso de Privacidad Institucional</Link> de la Universidad Tecnológica de Huejotzingo para el resguardo de mis datos personales y vinculación laboral con empresas registradas.
                    </span>
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
                      Registrando tu cuenta en UTH...
                    </>
                  ) : (
                    <>
                      Crear mi Cuenta de Egresado UTH
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORMULARIO EMPRESA */
              <form onSubmit={handleSubmitEmpresa} className="space-y-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4" />
                    1. Datos de la Organización o Empresa
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Nombre o Razón Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.nombre}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })}
                        placeholder="ej. AutoTech Solutions Puebla S.A. de C.V."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        RFC de la Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.rfc}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, rfc: e.target.value.toUpperCase() })}
                        placeholder="ej. ASP200101ABC"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 uppercase focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Sector *
                      </label>
                      <select
                        required
                        disabled={loadingCatalogs}
                        value={empresaForm.sector}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, sector: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-white"
                      >
                        {sectores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Giro Empresarial *
                      </label>
                      <select
                        required
                        disabled={loadingCatalogs}
                        value={empresaForm.giro}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, giro: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-white"
                      >
                        {giros.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Teléfono de Oficina
                      </label>
                      <input
                        type="tel"
                        value={empresaForm.telefono_oficina}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, telefono_oficina: e.target.value })}
                        placeholder="ej. 2222759000"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Domicilio de la Empresa / Planta *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.domicilio}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, domicilio: e.target.value })}
                        placeholder="ej. Corredor Industrial Huejotzingo Nave 4, Puebla"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Actividad Principal o Ramo *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.actividad_de_la_empresa}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, actividad_de_la_empresa: e.target.value })}
                        placeholder="ej. Fabricación de arneses automotrices y software embebido"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] flex items-center gap-2 mb-4">
                    <User className="w-4 h-4" />
                    2. Enlace de Recursos Humanos / Contacto
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Nombre del Contacto *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.nombre_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_contacto: e.target.value })}
                        placeholder="ej. Lic. Laura Flores"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Cargo en la Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={empresaForm.cargo_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, cargo_contacto: e.target.value })}
                        placeholder="ej. Coordinadora de Reclutamiento"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Correo de Contacto RH *
                      </label>
                      <input
                        type="email"
                        required
                        value={empresaForm.correo_contacto}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, correo_contacto: e.target.value })}
                        placeholder="ej. talento@empresa.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Teléfono Celular
                      </label>
                      <input
                        type="tel"
                        value={empresaForm.telefono_celular}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, telefono_celular: e.target.value })}
                        placeholder="ej. 2223456789"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#691C32] flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4" />
                    3. Cuenta y Acceso a la Plataforma
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Correo Electrónico de Usuario (Para iniciar sesión) *
                      </label>
                      <input
                        type="email"
                        required
                        value={empresaForm.email}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                        placeholder="ej. contacto@empresa.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Contraseña (mínimo 8 caracteres) *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={empresaForm.password}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={empresaForm.confirmPassword}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#691C32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aviso de Privacidad Obligatorio */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={empresaForm.acepta_aviso_privacidad}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, acepta_aviso_privacidad: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#691C32] focus:ring-[#691C32]"
                    />
                    <span className="text-xs text-[#636569] leading-relaxed">
                      Acepto el <Link href="/aviso-privacidad" target="_blank" className="font-bold text-[#691C32] hover:underline">Aviso de Privacidad Institucional</Link> y el compromiso de tratamiento responsable y legal de las postulaciones de egresados de la Universidad Tecnológica de Huejotzingo.
                    </span>
                  </label>
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#691C32] hover:bg-[#531426] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#691C32] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando empresa...
                    </>
                  ) : (
                    <>
                      Registrar Empresa en Bolsa UTH
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Enlace al Login */}
            <div className="pt-2 text-center text-xs text-[#636569] border-t border-zinc-100">
              ¿Ya tienes cuenta en la Bolsa de Trabajo UTH?{' '}
              <Link 
                href="/login" 
                className="font-bold text-[#00A887] hover:text-[#008F73] hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </div>
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

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00A887] animate-spin" />
      </div>
    }>
      <RegistroForm />
    </Suspense>
  );
}
