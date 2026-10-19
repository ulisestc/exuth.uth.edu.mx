/**
 * Mapa único de estatus → etiqueta + tono (DESIGN.md §2.4 y §7.5).
 * Todas las pantallas deben usarlo para que un mismo estatus se vea igual
 * en el portal del egresado, de la empresa y en la consola UTH.
 */

export type StatusTone = 'success' | 'warning' | 'warn' | 'info' | 'wine' | 'neutral' | 'danger' | 'muted' | 'brand';

export interface StatusInfo {
  label: string;
  tone: StatusTone;
  /** Descripción breve para tooltips o texto de apoyo */
  hint?: string;
}

const POSTULACION: Record<string, StatusInfo> = {
  revision_uth: {
    label: 'En revisión UTH',
    tone: 'warning',
    hint: 'Vinculación UTH está revisando que cumplas el perfil.',
  },
  enviada_empresa: {
    label: 'Enviada a empresa',
    tone: 'neutral',
    hint: 'Tu perfil fue turnado a la empresa.',
  },
  Aceptada: { label: 'Aceptada', tone: 'success', hint: 'La empresa aceptó tu postulación.' },
  rechazada_uth: {
    label: 'No cubre el perfil',
    tone: 'danger',
    hint: 'Vinculación UTH determinó que no cubres los requisitos.',
  },
  Rechazada: { label: 'Proceso concluido', tone: 'muted', hint: 'La empresa cerró el proceso.' },
};

const VACANTE: Record<string, StatusInfo> = {
  pendiente: { label: 'Pendiente de aprobación', tone: 'warning' },
  aprobada: { label: 'Publicada', tone: 'success' },
  rechazada: { label: 'Rechazada', tone: 'danger' },
  cerrada: { label: 'Cerrada', tone: 'muted' },
};

const EMPRESA: Record<string, StatusInfo> = {
  pendiente: { label: 'Pendiente de validación', tone: 'warning' },
  aprobada: { label: 'Convenio activo', tone: 'success' },
  rechazada: { label: 'Rechazada / suspendida', tone: 'danger' },
};

function lookup(map: Record<string, StatusInfo>, key: string | null | undefined): StatusInfo {
  if (!key) return { label: 'Sin estatus', tone: 'muted' };
  return map[key] ?? { label: key.replace(/_/g, ' '), tone: 'neutral' };
}

export const getPostulacionStatus = (estado?: string | null) => lookup(POSTULACION, estado);
export const getVacanteStatus = (status?: string | null) => lookup(VACANTE, status);
export const getEmpresaStatus = (status?: string | null) => lookup(EMPRESA, status);

export const postulacionStatus = getPostulacionStatus;
export const vacanteStatus = getVacanteStatus;
export const empresaStatus = getEmpresaStatus;

/* ── Etiquetas de catálogo compartidas ───────────────────────── */

export function getNivelLabel(nivel?: string | null, short = false): string {
  switch (nivel) {
    case 'TSU':
      return short ? 'TSU' : 'Técnico Superior Universitario';
    case 'ING_LIC':
      return short ? 'Ingeniería / Lic.' : 'Ingeniería / Licenciatura';
    case 'MTRIA':
      return 'Maestría';
    default:
      return nivel || 'Sin especificar';
  }
}

export function getModalidadLabel(modalidad?: string | null): string {
  switch (modalidad) {
    case 'home_office':
      return 'Remoto';
    case 'hibrido':
      return 'Híbrido';
    case 'presencial':
      return 'Presencial';
    default:
      return modalidad ? modalidad.replace(/_/g, ' ') : 'Sin especificar';
  }
}

export function formatDate(value?: string | null, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

export function formatMXN(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  });
}
