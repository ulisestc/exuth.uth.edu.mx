const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface AreaEstudio {
  id: number;
  nombre: string;
}

export interface Carrera {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  area: number;
}

export interface Vacante {
  id: number;
  clave_vacante: string;
  titulo: string;
  empresa: number;
  empresa_nombre?: string;
  area_estudio: number;
  area_estudio_nombre?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cerrada';
  fecha_registro: string;
  tipo_contratacion: 'tiempo_completo' | 'indeterminado' | 'temporal' | 'medio_tiempo';
  modalidad: 'presencial' | 'home_office' | 'hibrido';
  num_candidatos: number;
  horario_trabajo: string;
  nivel_estudios: 'TSU' | 'ING_LIC' | 'MTRIA';
  edad: string;
  genero: string;
  estado_civil: string;
  es_inclusiva: boolean;
  capacidades_especiales?: string | null;
  experiencia: string;
  conocimientos: string;
  habilidades: string;
  actitudes: string;
  responsabilidades: string;
  sueldo_minimo?: string | null;
  sueldo_maximo?: string | null;
  salario_a_tratar: boolean;
  prestaciones: string;
  incluye_transporte: boolean;
  incluye_comedor: boolean;
  documentos_requeridos: string;
  persona_contacto: string;
  entrevistador?: string | null;
  observaciones?: string | null;
}

export interface VacantesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vacante[];
}

export interface VacanteFilters {
  search?: string;
  area_estudio?: string;
  nivel_estudios?: string;
  modalidad?: string;
  incluye_transporte?: boolean;
  ordering?: string;
}

export async function fetchVacantes(filters: VacanteFilters = {}): Promise<Vacante[]> {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.area_estudio) params.append('area_estudio', filters.area_estudio);
    if (filters.nivel_estudios) params.append('nivel_estudios', filters.nivel_estudios);
    if (filters.modalidad) params.append('modalidad', filters.modalidad);
    if (filters.incluye_transporte) params.append('incluye_transporte', 'true');
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/vacantes/${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Error fetching vacantes: HTTP ${res.status}`);
      return [];
    }

    const data: VacantesResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Network error fetching vacantes:', error);
    return [];
  }
}

export async function fetchVacanteById(id: string | number): Promise<Vacante | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/${id}/`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching vacante ${id}:`, error);
    return null;
  }
}

export async function fetchAreasEstudio(): Promise<AreaEstudio[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/core/areas-estudio/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching areas de estudio:', error);
    return [];
  }
}

export async function fetchCarreras(): Promise<Carrera[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/core/carreras/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching carreras:', error);
    return [];
  }
}
