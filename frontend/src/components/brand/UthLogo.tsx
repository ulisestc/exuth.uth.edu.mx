import React from 'react';

export interface UthLogoProps {
  variant?: 'horizontal' | 'cuadrado' | 'vertical';
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const UthLogo: React.FC<UthLogoProps> = ({
  variant = 'horizontal',
  className = '',
  imgClassName = '',
  width,
  height,
  alt = 'Universidad Tecnológica de Huejotzingo',
}) => {
  const isHorizontal = variant === 'horizontal';
  const logoSrc = isHorizontal 
    ? '/logos/Logo_UTH_Horizontal.svg' 
    : '/logos/Logo_UTH_Cuadrado.svg';

  // Proporciones nativas de los SVGs oficiales:
  // Horizontal: 997x201 (aprox. 5:1)
  // Cuadrado/Vertical: 961x637 (aprox. 3:2)
  const defaultWidth = isHorizontal ? (width || 240) : (width || 180);
  const defaultHeight = isHorizontal ? (height || 48) : (height || 120);

  const defaultImgClasses = isHorizontal
    ? 'h-11 sm:h-12 w-auto object-contain'
    : 'h-24 sm:h-28 w-auto object-contain';

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={alt}
        width={defaultWidth}
        height={defaultHeight}
        className={`${defaultImgClasses} ${imgClassName}`}
        loading="eager"
      />
    </div>
  );
};
