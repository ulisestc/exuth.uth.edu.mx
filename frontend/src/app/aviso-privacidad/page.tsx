import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  FileText, 
  Building2, 
  GraduationCap, 
  Scale, 
  Mail, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { UthLogo } from '@/components/brand/UthLogo';

export const metadata = {
  title: 'Aviso de Privacidad y Términos de Uso | Bolsa de Trabajo UTH',
  description: 'Aviso de Privacidad Integral y Términos de Uso del Sistema de Bolsa de Trabajo y Seguimiento de Egresados de la Universidad Tecnológica de Huejotzingo.',
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navegación de Retorno */}
      <div className="flex items-center gap-2 text-xs text-[#636569]">
        <Link href="/" className="hover:text-[#00A887] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#2D2926]">Aviso de Privacidad y Términos Institucionales</span>
      </div>

      {/* Banner Principal Institucional */}
      <div className="bg-[#2D2926] text-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden relative">
        {/* Pleca Bicolor Oficial UTH */}
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#00A887]" />
          <div className="h-full w-1/3 bg-[#691C32]" />
        </div>

        <div className="p-6 sm:p-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Marco Legal y Transparencia Universitaria
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Vigencia 2026 · Versión 2.1
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Aviso de Privacidad Integral y Términos de Uso
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            Sistema Institucional de Bolsa de Trabajo y Seguimiento de Egresados (<strong className="text-white">exuth.uth.edu.mx</strong>) de la 
            Universidad Tecnológica de Huejotzingo.
          </p>
        </div>
      </div>

      {/* Tarjeta de Resumen Ejecutivo de Compromiso */}
      <div className="bg-[#00A887]/5 border border-[#00A887]/20 rounded-xl p-6 sm:p-8 space-y-3">
        <h2 className="text-base font-bold text-[#00A887] flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Compromiso Institucional de Protección de Datos
        </h2>
        <p className="text-xs sm:text-sm text-[#2D2926] leading-relaxed">
          La <strong>Universidad Tecnológica de Huejotzingo (UTH)</strong>, en cumplimiento con la 
          <em> Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados</em> y la 
          <em> Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Puebla</em>, 
          garantiza el tratamiento lícito, confidencial y seguro de la información personal proporcionada por egresados, alumnos y 
          representantes de organizaciones empleadoras en este portal.
        </p>
      </div>

      {/* Contenido Estructurado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Índice Rápido Lateral (Sticky en Escritorio) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-zinc-200 p-4 sticky top-6 space-y-2 hidden lg:block text-xs">
          <span className="font-bold uppercase tracking-wider text-[#636569] text-[10px] block mb-2">
            Contenido del Documento
          </span>
          <nav className="space-y-1">
            <a href="#responsable" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              1. Responsable del Tratamiento
            </a>
            <a href="#fundamento" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              2. Fundamento Legal
            </a>
            <a href="#finalidades" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              3. Finalidades del Tratamiento
            </a>
            <a href="#datos" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              4. Datos Personales Recabados
            </a>
            <a href="#transferencia" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              5. Transferencia a Empresas
            </a>
            <a href="#arco" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              6. Ejercicio de Derechos ARCO
            </a>
            <a href="#terminos" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              7. Términos de Uso del Sistema
            </a>
            <a href="#contacto" className="block text-[#636569] hover:text-[#00A887] py-1 transition-colors">
              8. Contacto y Transparencia
            </a>
          </nav>
        </div>

        {/* Articulado Principal */}
        <div className="lg:col-span-3 space-y-8 text-xs sm:text-sm text-[#374151] leading-relaxed">
          
          {/* 1. Responsable */}
          <section id="responsable" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00A887]" />
              1. Responsable del Tratamiento de los Datos Personales
            </h2>
            <p>
              La <strong>Universidad Tecnológica de Huejotzingo (UTH)</strong>, a través de la 
              <strong> Dirección de Vinculación y Extensión Universitaria</strong> y el 
              <strong> Departamento de Prácticas, Estadías y Bolsa de Trabajo</strong>, con domicilio oficial en:
            </p>
            <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs font-medium text-[#2D2926] flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
              <span>
                Camino Real a San Mateo s/n, Junta Auxiliar de Santa Ana Xalmimilulco, Municipio de Huejotzingo, 
                Puebla, C.P. 74169.
              </span>
            </div>
            <p>
              Es la entidad responsable del resguardo, tratamiento y confidencialidad de los datos personales que usted 
              proporcione para el uso del sistema informático de vinculación laboral.
            </p>
          </section>

          {/* 2. Fundamento Legal */}
          <section id="fundamento" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#691C32]" />
              2. Fundamento Legal
            </h2>
            <p>
              El tratamiento de los datos personales se fundamenta en las siguientes disposiciones jurídicas aplicables:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#4B5563]">
              <li>
                <strong>Constitución Política de los Estados Unidos Mexicanos:</strong> Artículo 6º, apartado A, y Artículo 16, párrafo segundo.
              </li>
              <li>
                <strong>Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO):</strong> Artículos 1, 3, 16, 17, 18 y relativos.
              </li>
              <li>
                <strong>Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Puebla:</strong> Artículos 1, 4, 15, 19, 21, 23 y demás aplicables.
              </li>
              <li>
                <strong>Decreto de Creación y Reglamento Interior de la Universidad Tecnológica de Huejotzingo:</strong> Facultades para promover la inserción laboral y seguimiento de egresados.
              </li>
            </ul>
          </section>

          {/* 3. Finalidades */}
          <section id="finalidades" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00A887]" />
              3. Finalidades del Tratamiento
            </h2>
            <p>
              Los datos personales recabados serán utilizados de manera exclusiva para las siguientes finalidades legítimas:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <h3 className="text-xs font-bold text-[#00A887] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  Finalidades para Egresados y Alumnos
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#374151]">
                  <li>Verificar la matrícula y formación académica contra el Padrón Escolar de la UTH.</li>
                  <li>Integrar el expediente curricular y el Currículum Vitae digital (CV).</li>
                  <li>Postularse a ofertas laborales acordes al perfil profesional del egresado.</li>
                  <li>Canalizar y turnar formalmente el perfil ante empresas aliadas una vez validado por Vinculación.</li>
                  <li>Generar indicadores estadísticos consolidados de inserción laboral para auditorías y acreditaciones de calidad (CACEI, CONAIC, ISO 9001 / 21001).</li>
                  <li>Enviar notificaciones institucionales automatizadas por correo electrónico sobre el estatus de sus aplicaciones.</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100">
                <h3 className="text-xs font-bold text-[#691C32] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4" />
                  Finalidades para Organizaciones Empleadoras
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#374151]">
                  <li>Validar la personalidad jurídica y autenticidad de la empresa vinculada mediante convenio.</li>
                  <li>Publicar vacantes de empleo y estadías profesionales verificadas por el personal de la UTH.</li>
                  <li>Consultar los perfiles curriculares de candidatos canalizados y turnados por Vinculación.</li>
                  <li>Registrar y formalizar la contratación laboral de egresados de la comunidad universitaria.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Datos Recabados */}
          <section id="datos" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00A887]" />
              4. Datos Personales Recabados
            </h2>
            <p>
              Para cumplir con las finalidades descritas, se recaban los siguientes grupos de datos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-bold text-[#2D2926] block mb-1">Datos de Identificación y Contacto:</span>
                <span className="text-[#636569]">
                  Nombre(s), apellidos, CURP, matrícula universitaria, teléfono celular, teléfono fijo, 
                  domicilio y correo electrónico.
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-bold text-[#2D2926] block mb-1">Datos Académicos y Profesionales:</span>
                <span className="text-[#636569]">
                  Carrera/programa cursado, nivel académico (TSU, Ingeniería, Licenciatura, Maestría), 
                  año de egreso, estatus de titulación, habilidades, idiomas y Currículum Vitae adjunto.
                </span>
              </div>
            </div>
            <p className="text-xs text-[#636569]">
              <em>Nota:</em> La plataforma no solicita ni almacena datos personales sensibles de carácter biométrico, 
              financiero o de salud sin consentimiento expreso por escrito.
            </p>
          </section>

          {/* 5. Transferencia */}
          <section id="transferencia" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00A887]" />
              5. Transferencia de Datos Personales
            </h2>
            <p>
              Los datos personales de los egresados <strong>únicamente serán transferidos a terceros</strong> en los siguientes casos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#4B5563]">
              <li>
                <strong>A empresas empleadoras formalmente registradas:</strong> Cuando el egresado se postule voluntariamente a una vacante y la Dirección de Vinculación de la UTH valide y apruebe el perfil del candidato, turnando su CV y medios de contacto para fines exclusivos de selección laboral.
              </li>
              <li>
                <strong>A organismos acreditadores educativos:</strong> En modalidad disociada y estadística cuantitativa (sin revelar datos sensibles nominales) para fines de auditoría académica CACEI, CONAIC e ISO.
              </li>
              <li>
                <strong>A autoridades competentes:</strong> En los supuestos legalmente previstos por orden judicial fundada y motivada.
              </li>
            </ul>
            <p className="text-xs font-semibold text-[#00A887]">
              La UTH no comercializa, no renta ni transfiere bases de datos con fines publicitarios o lucrativos ajenos a la vinculación institucional.
            </p>
          </section>

          {/* 6. Derechos ARCO */}
          <section id="arco" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#691C32]" />
              6. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones de su uso (<strong>Acceso</strong>); 
              solicitar la corrección de su información en caso de que esté desactualizada, sea inexacta o incompleta (<strong>Rectificación</strong>); 
              que la eliminemos de nuestros registros cuando considere que no está siendo utilizada conforme a los principios y deberes aplicables (<strong>Cancelación</strong>); 
              así como oponerse al tratamiento de los mismos para fines específicos (<strong>Oposición</strong>).
            </p>
            <p>
              Para ejercer cualquiera de los derechos ARCO, podrá presentar la solicitud correspondiente ante la:
            </p>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <span className="font-bold text-[#2D2926] block">Unidad de Transparencia de la UTH:</span>
              <p className="text-[#636569]">
                Correo de contacto: <a href="mailto:transparencia@uth.edu.mx" className="text-[#00A887] font-bold">transparencia@uth.edu.mx</a> / <a href="mailto:vinculacion@uth.edu.mx" className="text-[#00A887] font-bold">vinculacion@uth.edu.mx</a>
              </p>
              <p className="text-[#636569]">
                Teléfono: +52 (227) 275 9300 extensión Vinculación y Prácticas.
              </p>
            </div>
          </section>

          {/* 7. Términos de Servicio */}
          <section id="terminos" className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 space-y-3 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#2D2926] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#00A887]" />
              7. Términos y Condiciones de Uso de la Plataforma
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#4B5563]">
              <li>
                <strong>Veracidad de la información:</strong> El egresado garantiza que los datos curriculares, certificaciones y trayectoria reportados en su perfil y archivo CV son verídicos y auténticos.
              </li>
              <li>
                <strong>Responsabilidad patronal:</strong> La Universidad Tecnológica de Huejotzingo actúa como una entidad facilitadora de vinculación académica-laboral. Las relaciones laborales, contratos, salarios y prestaciones son de exclusiva responsabilidad entre la empresa contratante y el candidato.
              </li>
              <li>
                <strong>Conducta ética de las empresas:</strong> Las empresas se comprometen a respetar la legislación laboral mexicana (Ley Federal del Trabajo), garantizar condiciones de no discriminación y abstenerse de publicar ofertas con costos de intermediación para el candidato.
              </li>
              <li>
                <strong>Seguridad y confidencialidad:</strong> Las cuentas son personales e intransferibles. El usuario es responsable de mantener la confidencialidad de su contraseña de acceso.
              </li>
            </ul>
          </section>

          {/* 8. Contacto */}
          <section id="contacto" className="bg-[#2D2926] text-white rounded-xl p-6 sm:p-8 space-y-4 scroll-mt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#C2BA98] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#00A887]" />
              8. Contacto Institucional y Dudas
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Para cualquier duda, aclaración o sugerencia respecto a este Aviso de Privacidad y el funcionamiento de la bolsa de trabajo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
              <div className="space-y-1">
                <span className="font-bold text-white block">Dirección de Vinculación UTH</span>
                <p>Edificio de Rectoría, Planta Baja</p>
                <p>Email: vinculacion@uth.edu.mx</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block">Departamento de Prácticas y Bolsa de Trabajo</span>
                <p>Camino Real a San Mateo s/n, Huejotzingo, Pue.</p>
                <p>Sitio Oficial: <a href="https://www.uth.edu.mx" target="_blank" rel="noopener noreferrer" className="text-[#00A887] font-semibold underline">www.uth.edu.mx</a></p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
