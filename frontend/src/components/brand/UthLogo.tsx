import React from 'react';

interface UthLogoProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const UthLogo: React.FC<UthLogoProps> = ({ variant = 'horizontal', className = '' }) => {
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <svg viewBox="0 0 280 180" className="w-48 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cabeza Quetzalcoatl Náhuatl estilizada */}
          <g transform="translate(145, 10) scale(0.65)">
            <path d="M5 25 C15 10, 45 5, 80 5 C110 5, 140 20, 150 40 C145 55, 120 60, 95 60 L145 60 C145 75, 115 80, 85 80 L35 80" stroke="#2D2926" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="85" cy="35" r="9" stroke="#2D2926" strokeWidth="6" fill="none" />
            <path d="M15 15 C-5 25, -15 45, -5 65" stroke="#2D2926" strokeWidth="8" strokeLinecap="round" />
            <path d="M-10 40 C-30 45, -30 65, -15 75" stroke="#2D2926" strokeWidth="8" strokeLinecap="round" />
            <path d="M-5 65 C-20 75, -15 95, 5 95" stroke="#2D2926" strokeWidth="8" strokeLinecap="round" />
          </g>
          {/* Pleca horizontal superior */}
          <rect x="25" y="32" width="115" height="4" fill="#2D2926" />
          <rect x="20" y="38" width="120" height="7" fill="#00A887" />

          {/* Letras UT inclinadas */}
          <g transform="translate(10, 50) skewX(-14)">
            {/* U */}
            <path d="M20 0 L40 0 L32 40 C30 52, 42 55, 50 55 C58 55, 68 52, 70 40 L78 0 L98 0 L88 45 C82 68, 55 72, 40 72 C22 72, 8 66, 12 45 Z" fill="#00A887" />
            {/* T */}
            <path d="M85 0 L145 0 L141 18 L123 18 L113 70 L93 70 L103 18 L85 18 Z" fill="#00A887" />
            {/* H */}
            <path d="M140 0 L158 0 L153 25 L180 25 L185 0 L203 0 L191 70 L173 70 L178 43 L151 43 L145 70 L127 70 Z" fill="#00A887" />
          </g>

          {/* Razón Social */}
          <text x="140" y="148" textAnchor="middle" fill="#2D2926" fontFamily="Arial, sans-serif" fontSize="13" fontStyle="italic">
            Universidad Tecnológica
          </text>
          <text x="140" y="168" textAnchor="middle" fill="#2D2926" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fontStyle="italic" letterSpacing="3">
            de HUEJOTZINGO
          </text>
        </svg>
      </div>
    );
  }

  // Convivencia Horizontal (Página 8 del Manual)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg viewBox="0 0 240 70" className="h-12 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cabeza Quetzalcoatl Náhuatl compacta */}
        <g transform="translate(90, 2) scale(0.32)">
          <path d="M5 25 C15 10, 45 5, 80 5 C110 5, 140 20, 150 40 C145 55, 120 60, 95 60 L145 60 C145 75, 115 80, 85 80 L35 80" stroke="#2D2926" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="85" cy="35" r="9" stroke="#2D2926" strokeWidth="6" fill="none" />
          <path d="M15 15 C-5 25, -15 45, -5 65" stroke="#2D2926" strokeWidth="9" strokeLinecap="round" />
          <path d="M-10 40 C-30 45, -30 65, -15 75" stroke="#2D2926" strokeWidth="9" strokeLinecap="round" />
          <path d="M-5 65 C-20 75, -15 95, 5 95" stroke="#2D2926" strokeWidth="9" strokeLinecap="round" />
        </g>
        {/* Pleca superior */}
        <rect x="15" y="14" width="70" height="3" fill="#2D2926" />
        <rect x="10" y="19" width="75" height="5" fill="#00A887" />

        {/* Letras UTH */}
        <g transform="translate(5, 27) skewX(-14) scale(0.65)">
          <path d="M15 0 L30 0 L24 28 C22 36, 30 38, 36 38 C42 38, 50 36, 52 28 L58 0 L73 0 L66 32 C61 48, 41 50, 30 50 C16 50, 6 46, 9 32 Z" fill="#00A887" />
          <path d="M64 0 L108 0 L105 12 L92 12 L84 50 L69 50 L77 12 L64 12 Z" fill="#00A887" />
          <path d="M105 0 L119 0 L115 18 L136 18 L140 0 L154 0 L145 50 L131 50 L135 31 L114 31 L110 50 L96 50 Z" fill="#00A887" />
        </g>
      </svg>
      <div className="flex flex-col border-l border-zinc-300 pl-3">
        <span className="text-[11px] leading-tight text-[#636569] font-normal italic">
          Universidad Tecnológica de
        </span>
        <span className="text-sm font-bold tracking-wider text-[#2D2926] italic uppercase">
          HUEJOTZINGO
        </span>
        <span className="text-[9px] uppercase tracking-widest text-[#00A887] font-semibold">
          Bolsa de Trabajo
        </span>
      </div>
    </div>
  );
};
