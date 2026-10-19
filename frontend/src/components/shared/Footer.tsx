import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { UthLogo } from '../brand/UthLogo';

export const Footer = () => {
  return (
    <footer className="bg-parchment text-ink border-t border-hairline mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Identidad Institucional */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <UthLogo variant="horizontal" imgClassName="h-10 w-auto" />
            </Link>
            <p className="text-caption text-ink-64 max-w-sm leading-relaxed">
              Organismo Público Descentralizado del Gobierno del Estado de Puebla. 
              Vinculación profesional ética, tecnológica y de alto impacto para 
              egresados y el sector productivo regional.
            </p>
            <div className="text-caption text-ink-64 space-y-2 pt-2">
              <p className="flex items-start gap-2">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Camino Real a San Mateo S/N, Santa Ana Xalmimilulco, Huejotzingo, Pue. C.P. 74169</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                <span>Tel: (227) 2 75 9300</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-primary shrink-0" />
                <span>bolsa.trabajo@uth.edu.mx</span>
              </p>
            </div>
          </div>

          {/* Bolsa de Trabajo */}
          <div>
            <h4 className="text-caption font-semibold text-ink uppercase tracking-wider mb-4">
              Bolsa de Trabajo
            </h4>
            <ul className="space-y-2.5 text-caption text-ink-64">
              <li>
                <Link href="/vacantes" className="hover:text-ink transition-colors">
                  Vacantes vigentes
                </Link>
              </li>
              <li>
                <Link href="/empresas" className="hover:text-ink transition-colors">
                  Directorio de empresas
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-ink transition-colors">
                  Ferias y reclutamientos
                </Link>
              </li>
              <li>
                <Link href="/registro?tipo=egresado" className="hover:text-ink transition-colors">
                  Registro de egresados
                </Link>
              </li>
              <li>
                <Link href="/registro?tipo=empresa" className="hover:text-ink transition-colors">
                  Alta de empresas
                </Link>
              </li>
            </ul>
          </div>

          {/* Portales */}
          <div>
            <h4 className="text-caption font-semibold text-ink uppercase tracking-wider mb-4">
              Ecosistema
            </h4>
            <ul className="space-y-2.5 text-caption text-ink-64">
              <li>
                <Link href="/portal-egresado" className="hover:text-ink transition-colors">
                  Portal del Egresado
                </Link>
              </li>
              <li>
                <Link href="/portal-empresa" className="hover:text-ink transition-colors">
                  Portal de la Empresa
                </Link>
              </li>
              <li>
                <Link href="/admin-uth" className="hover:text-ink transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-ink-64" />
                  <span>Consola Vinculación</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.uth.edu.mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors"
                >
                  Sitio Web Oficial UTH ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Transparencia y Legal */}
          <div>
            <h4 className="text-caption font-semibold text-ink uppercase tracking-wider mb-4">
              Transparencia
            </h4>
            <ul className="space-y-2.5 text-caption text-ink-64">
              <li>
                <Link href="/aviso-privacidad" className="hover:text-ink transition-colors">
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link href="/aviso-privacidad#terminos" className="hover:text-ink transition-colors">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link href="/aviso-privacidad#marco-legal" className="hover:text-ink transition-colors">
                  Marco normativo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Fila Legal y Derechos */}
        <div className="mt-14 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-fine text-ink-64 gap-4">
          <p>© {new Date().getFullYear()} Universidad Tecnológica de Huejotzingo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" />
              <span>Plataforma institucional exuth.uth.edu.mx</span>
            </span>
            <Link
              href="/login?tipo=admin"
              className="text-ink-48 hover:text-ink transition-colors"
              title="Acceso reservado a personal universitario"
            >
              Acceso Institucional
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
