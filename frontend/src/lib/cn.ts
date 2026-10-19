import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge necesita conocer los tokens personalizados del sistema
 * (DESIGN.md §11); si no, confunde `text-caption` (tamaño) con `text-ink` (color)
 * y descarta uno de los dos.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'hero',
            'display-lg',
            'display-md',
            'lead',
            'lead-airy',
            'tagline',
            'body',
            'caption',
            'fine',
          ],
        },
      ],
      rounded: [{ rounded: ['card', 'field', 'utility'] }],
      shadow: [{ shadow: ['photo', 'sheet'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
