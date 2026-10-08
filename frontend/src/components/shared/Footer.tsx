import React from 'react';
import Link from 'next/link';
import { UthLogo } from '../brand/UthLogo';

export const Footer = () => {
  return (
    <footer className="bg-[#2D2926] text-white border-t-4 border-[#00A887]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna Institucional */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-2 rounded-lg inline-flex items-center shadow-xs">
                <UthLogo variant="horizontal" imgClassName="h-9 sm:h-10" />
              </div>
            </div>
            <p className="text-xs text-[#D6D1C4] max-w-md leading-relaxed">
              Organismo Público Descentralizado del Gobierno del Estado de Puebla. 
              Formando profesionistas competentes con sentido humano para la vinculación 
              de impacto social y productivo.
            </p>
            <div className="text-xs text-[#A6A6A8] space-y-1">
              <p>📍 Camino Real a San Mateo S/N, Santa Ana Xalmimilulco, Huejotzingo, Pue. C.P. 74169</p>
              <p>📞 Tel: (227) 2 75 9300 | Correo: bolsa.trabajo@uth.edu.mx</p>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C2BA98] mb-4">
              Bolsa de Trabajo
            </h4>
            <ul className="space-y-2 text-xs text-[#D6D1C4]">
              <li>
                <Link href="/vacantes" className="hover:text-[#00A887] transition-colors">
                  Vacantes Vigentes
                </Link>
              </li>
              <li>
                <Link href="/login?tipo=egresado" className="hover:text-[#00A887] transition-colors">
                  Registro de Egresados
                </Link>
              </li>
              <li>
                <Link href="/login?tipo=empresa" className="hover:text-[#00A887] transition-colors">
                  Alta de Empresas
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-[#00A887] transition-colors">
                  Ferias de Empleo
                </Link>
              </li>
            </ul>
          </div>

          {/* Marco Legal Institucional */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C2BA98] mb-4">
              Transparencia
            </h4>
            <ul className="space-y-2 text-xs text-[#D6D1C4]">
              <li>
                <Link href="/aviso-privacidad" className="hover:text-[#00A887] transition-colors">
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <a href="https://www.uth.edu.mx" target="_blank" rel="noopener noreferrer" className="hover:text-[#00A887] transition-colors">
                  Portal Oficial UTH
                </a>
              </li>
              <li>
                <Link href="/aviso-privacidad#terminos" className="hover:text-[#00A887] transition-colors">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Pleca inferior */}
        <div className="mt-12 pt-6 border-t border-zinc-700/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A6A6A8]">
          <p>© {new Date().getFullYear()} Universidad Tecnológica de Huejotzingo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00A887]" />
            <span>Sistema Institucional exuth.uth.edu.mx</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
