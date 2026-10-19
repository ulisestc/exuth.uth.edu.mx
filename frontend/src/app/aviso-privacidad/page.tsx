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
  CheckCircle2,
} from 'lucide-react';
import {
  Container,
  Card,
  PageHeader,
  StatusPill,
  Pleca,
} from '@/components/ui';

export const metadata = {
  title: 'Aviso de Privacidad y Términos de Uso | Bolsa de Trabajo UTH',
  description:
    'Aviso de Privacidad Integral y Términos de Uso del Sistema de Bolsa de Trabajo y Seguimiento de Egresados de la Universidad Tecnológica de Huejotzingo.',
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="py-10 sm:py-16 space-y-10">
      <Container size="content">
        {/* Retorno */}
        <div className="flex items-center gap-2 text-caption text-ink-64 mb-6">
          <Link
            href="/"
            className="hover:text-ink flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            <span>Inicio</span>
          </Link>
          <span>/</span>
          <span className="text-ink">Aviso de Privacidad</span>
        </div>

        {/* Encabezado */}
        <PageHeader
          eyebrow="Marco Legal y Transparencia Universitaria"
          title="Aviso de Privacidad Integral y Términos de Uso"
          description="Sistema Institucional de Bolsa de Trabajo y Seguimiento de Egresados (exuth.uth.edu.mx) de la Universidad Tecnológica de Huejotzingo. Vigencia 2026 · Versión 2.1."
        />

        {/* Resumen de Compromiso */}
        <Card className="p-6 sm:p-8 bg-parchment border-0 ring-0 mt-8 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-tagline">
            <Lock className="size-4 text-primary" />
            <span>Compromiso Institucional de Protección de Datos</span>
          </div>
          <p className="text-body text-ink-80 leading-relaxed">
            La <strong>Universidad Tecnológica de Huejotzingo (UTH)</strong>, en cumplimiento con la{' '}
            <em>Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados</em> y la{' '}
            <em>Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Puebla</em>,
            garantiza el tratamiento lícito, confidencial y seguro de la información personal proporcionada por egresados, alumnos y
            representantes de organizaciones empleadoras en este portal.
          </p>
        </Card>

        {/* Contenido Estructurado */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-10">
          {/* Índice lateral sticky */}
          <div className="lg:col-span-1 bg-parchment rounded-card p-5 sticky top-20 space-y-2 hidden lg:block text-caption">
            <span className="font-semibold uppercase tracking-wider text-ink-64 text-fine block mb-2">
              Contenido
            </span>
            <nav className="space-y-1.5">
              <a href="#responsable" className="block text-ink-64 hover:text-ink transition-colors">
                1. Responsable del Tratamiento
              </a>
              <a href="#fundamento" className="block text-ink-64 hover:text-ink transition-colors">
                2. Fundamento Legal
              </a>
              <a href="#finalidades" className="block text-ink-64 hover:text-ink transition-colors">
                3. Finalidades del Tratamiento
              </a>
              <a href="#datos" className="block text-ink-64 hover:text-ink transition-colors">
                4. Datos Personales Recabados
              </a>
              <a href="#transferencia" className="block text-ink-64 hover:text-ink transition-colors">
                5. Transferencia a Empresas
              </a>
              <a href="#arco" className="block text-ink-64 hover:text-ink transition-colors">
                6. Ejercicio de Derechos ARCO
              </a>
              <a href="#terminos" className="block text-ink-64 hover:text-ink transition-colors">
                7. Términos de Uso del Sistema
              </a>
              <a href="#contacto" className="block text-ink-64 hover:text-ink transition-colors">
                8. Contacto y Transparencia
              </a>
            </nav>
          </div>

          {/* Artículos */}
          <div className="lg:col-span-3 space-y-8 text-body text-ink-80 leading-relaxed">
            {/* 1. Responsable */}
            <Card id="responsable" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                1. Responsable del Tratamiento de los Datos Personales
              </h2>
              <p>
                La <strong>Universidad Tecnológica de Huejotzingo (UTH)</strong>, a través de la{' '}
                <strong>Dirección de Vinculación y Extensión Universitaria</strong> y el{' '}
                <strong>Departamento de Prácticas, Estadías y Bolsa de Trabajo</strong>, con domicilio oficial en:
              </p>
              <div className="p-4 rounded-card bg-parchment text-caption font-medium text-ink flex items-start gap-2.5">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Camino Real a San Mateo s/n, Junta Auxiliar de Santa Ana Xalmimilulco, Municipio de Huejotzingo,
                  Puebla, C.P. 74169.
                </span>
              </div>
              <p>
                Es la entidad responsable del resguardo, tratamiento y confidencialidad de los datos personales que usted
                proporcione para el uso del sistema informático de vinculación laboral.
              </p>
            </Card>

            {/* 2. Fundamento Legal */}
            <Card id="fundamento" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <Scale className="size-5 text-wine" />
                2. Fundamento Legal
              </h2>
              <p>
                El tratamiento de los datos personales se fundamenta en las siguientes disposiciones jurídicas aplicables:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-caption text-ink-80">
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
            </Card>

            {/* 3. Finalidades */}
            <Card id="finalidades" className="p-6 sm:p-8 space-y-5 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                3. Finalidades del Tratamiento
              </h2>
              <p>
                Los datos personales recabados serán utilizados de manera exclusiva para las siguientes finalidades legítimas:
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-card bg-parchment space-y-2">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <GraduationCap className="size-4" />
                    Finalidades para Egresados y Alumnos
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-caption text-ink-80">
                    <li>Verificar la matrícula y formación académica contra el Padrón Escolar de la UTH.</li>
                    <li>Integrar el expediente curricular y el Currículum Vitae digital (CV).</li>
                    <li>Postularse a ofertas laborales acordes al perfil profesional del egresado.</li>
                    <li>Canalizar y turnar formalmente el perfil ante empresas aliadas una vez validado por Vinculación.</li>
                    <li>Generar indicadores estadísticos consolidados de inserción laboral para auditorías y acreditaciones de calidad (CACEI, CONAIC, ISO 9001 / 21001).</li>
                    <li>Enviar notificaciones institucionales automatizadas por correo electrónico sobre el estatus de sus aplicaciones.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-card bg-parchment space-y-2">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-wine flex items-center gap-1.5">
                    <Building2 className="size-4" />
                    Finalidades para Organizaciones Empleadoras
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-caption text-ink-80">
                    <li>Validar la personalidad jurídica y autenticidad de la empresa vinculada mediante convenio.</li>
                    <li>Publicar vacantes de empleo y estadías profesionales verificadas por el personal de la UTH.</li>
                    <li>Consultar los perfiles curriculares de candidatos canalizados y turnados por Vinculación.</li>
                    <li>Registrar y formalizar la contratación laboral de egresados de la comunidad universitaria.</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 4. Datos Recabados */}
            <Card id="datos" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                4. Datos Personales Recabados
              </h2>
              <p>
                Para cumplir con las finalidades descritas, se recaban los siguientes grupos de datos:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
                <div className="p-4 rounded-card bg-parchment">
                  <span className="font-semibold text-ink block mb-1">Datos de Identificación y Contacto:</span>
                  <span className="text-ink-64">
                    Nombre(s), apellidos, CURP, matrícula universitaria, teléfono celular, teléfono fijo,
                    domicilio y correo electrónico.
                  </span>
                </div>
                <div className="p-4 rounded-card bg-parchment">
                  <span className="font-semibold text-ink block mb-1">Datos Académicos y Profesionales:</span>
                  <span className="text-ink-64">
                    Carrera/programa cursado, nivel académico (TSU, Ingeniería, Licenciatura, Maestría),
                    año de egreso, estatus de titulación, habilidades, idiomas y Currículum Vitae adjunto.
                  </span>
                </div>
              </div>
              <p className="text-caption text-ink-64">
                <em>Nota:</em> La plataforma no solicita ni almacena datos personales sensibles de carácter biométrico,
                financiero o de salud sin consentimiento expreso por escrito.
              </p>
            </Card>

            {/* 5. Transferencia */}
            <Card id="transferencia" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                5. Transferencia de Datos Personales
              </h2>
              <p>
                Los datos personales de los egresados <strong>únicamente serán transferidos a terceros</strong> en los siguientes casos:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-caption text-ink-80">
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
              <p className="text-caption font-medium text-primary">
                La UTH no comercializa, no renta ni transfiere bases de datos con fines publicitarios o lucrativos ajenos a la vinculación institucional.
              </p>
            </Card>

            {/* 6. Derechos ARCO */}
            <Card id="arco" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <Lock className="size-5 text-wine" />
                6. Ejercicio de Derechos ARCO
              </h2>
              <p>
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones de su uso (<strong>Acceso</strong>);
                solicitar la corrección de su información en caso de que esté desactualizada, sea inexacta o incompleta (<strong>Rectificación</strong>);
                que la eliminemos de nuestros registros cuando considere que no está siendo utilizada conforme a los principios y deberes aplicables (<strong>Cancelación</strong>);
                así como oponerse al tratamiento de los mismos para fines específicos (<strong>Oposición</strong>).
              </p>
              <div className="p-4 rounded-card bg-parchment space-y-1.5 text-caption">
                <span className="font-semibold text-ink block">Unidad de Transparencia de la UTH:</span>
                <p className="text-ink-64">
                  Correo de contacto:{' '}
                  <a href="mailto:transparencia@uth.edu.mx" className="text-primary font-medium hover:underline">
                    transparencia@uth.edu.mx
                  </a>{' '}
                  /{' '}
                  <a href="mailto:vinculacion@uth.edu.mx" className="text-primary font-medium hover:underline">
                    vinculacion@uth.edu.mx
                  </a>
                </p>
                <p className="text-ink-64">Teléfono: +52 (227) 275 9300 ext. Vinculación y Prácticas.</p>
              </div>
            </Card>

            {/* 7. Términos de Servicio */}
            <Card id="terminos" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-canvas">
              <h2 className="text-tagline text-ink font-semibold flex items-center gap-2">
                <Scale className="size-5 text-primary" />
                7. Términos y Condiciones de Uso de la Plataforma
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-caption text-ink-80">
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
            </Card>

            {/* 8. Contacto */}
            <Card id="contacto" className="p-6 sm:p-8 space-y-4 scroll-mt-24 bg-tile text-white">
              <h2 className="text-tagline font-semibold flex items-center gap-2 text-cream">
                <Mail className="size-5 text-brand" />
                8. Contacto Institucional
              </h2>
              <p className="text-caption text-cream/90">
                Para cualquier duda, aclaración o sugerencia respecto a este Aviso de Privacidad y el funcionamiento de la bolsa de trabajo:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption text-cream/80 pt-2">
                <div className="space-y-1">
                  <span className="font-semibold text-white block">Dirección de Vinculación UTH</span>
                  <p>Edificio de Rectoría, Planta Baja</p>
                  <p>Email: vinculacion@uth.edu.mx</p>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-white block">Departamento de Prácticas y Bolsa de Trabajo</span>
                  <p>Camino Real a San Mateo s/n, Huejotzingo, Pue.</p>
                  <p>
                    Sitio web:{' '}
                    <a
                      href="https://www.uth.edu.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand font-medium hover:underline"
                    >
                      www.uth.edu.mx
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
