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
  empresa_logo?: string | null;
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

export interface Postulacion {
  id: number;
  vacante: number;
  vacante_titulo?: string;
  vacante_empresa?: string;
  vacante_modalidad?: string;
  vacante_clave?: string;
  egresado: number;
  fecha_postulacion: string;
  estado: 'revision_uth' | 'rechazada_uth' | 'enviada_empresa' | 'Aceptada' | 'Rechazada';
  notas_uth?: string | null;
  candidato_nombre?: string;
  candidato_email?: string;
  candidato_telefono?: string | null;
  candidato_carrera?: string;
  candidato_nivel_estudios?: string;
  candidato_matricula?: string;
  candidato_cv?: string | null;
  candidato_habilidades?: string;
  candidato_domicilio?: string;
}

export interface PostulacionesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Postulacion[];
}

export async function fetchMisPostulaciones(accessToken: string): Promise<Postulacion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/postulaciones/`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(`Error fetching postulaciones: HTTP ${res.status}`);
      return [];
    }

    const data: PostulacionesResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Network error fetching postulaciones:', error);
    return [];
  }
}

export async function crearPostulacion(
  vacanteId: number, 
  accessToken: string
): Promise<{ success: boolean; data?: Postulacion; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/postulaciones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ vacante: vacanteId }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = Array.isArray(data) && data[0]
        ? data[0]
        : data.detail || (data.non_field_errors && data.non_field_errors[0]) || 'No fue posible registrar la postulación.';
      return { success: false, error: errorMsg };
    }

    return { success: true, data: data as Postulacion };
  } catch (error: any) {
    console.error('Error creating postulacion:', error);
    return { success: false, error: 'Error de conexión con el servidor de vinculación.' };
  }
}

export interface Giro {
  id: number;
  nombre: string;
}

export interface Sector {
  id: number;
  nombre: string;
}

export interface RegistroEgresadoData {
  matricula: string;
  curp: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: number;
  nivel_estudios: 'TSU' | 'ING_LIC' | 'MTRIA';
  genero: 'M' | 'F' | 'O';
  telefono_celular: string;
  domicilio: string;
  habilidades: string;
  email: string;
  password: string;
  acepta_aviso_privacidad: boolean;
}

export interface RegistroEmpresaData {
  nombre: string;
  domicilio: string;
  correo_contacto: string;
  actividad_de_la_empresa: string;
  giro: number;
  sector: number;
  nombre_contacto: string;
  cargo_contacto: string;
  telefono_oficina?: string;
  telefono_celular?: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  password: string;
  acepta_aviso_privacidad: boolean;
}

export async function fetchGiros(): Promise<Giro[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/core/giros/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching giros:', error);
    return [];
  }
}

export async function fetchSectores(): Promise<Sector[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/core/sectores/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching sectores:', error);
    return [];
  }
}

export interface EgresadoProfile {
  id: number;
  user: number;
  matricula: string;
  curp: string;
  cv: string | null;
  carrera: string;
  telefono_celular: string | null;
  telefono_casa: string | null;
  domicilio: string;
  nivel_estudios: 'TSU' | 'ING_LIC' | 'MTRIA';
  genero: 'M' | 'F' | 'O';
  capacidades_especiales: string | null;
  habilidades: string;
  documentos: string | null;
  colocado: boolean;
  es_verificado_padron: boolean;
}

export async function fetchMiPerfilEgresado(token: string): Promise<EgresadoProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/egresados/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching perfil egresado:', error);
    return null;
  }
}

export async function uploadMiCv(
  token: string,
  file: File
): Promise<{ success: boolean; profile?: EgresadoProfile; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('cv', file);

    const res = await fetch(`${API_BASE_URL}/profiles/egresados/me/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.cv?.[0] || data.detail || 'Error al subir el currículum.';
      return { success: false, error: errorMsg };
    }

    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error uploading CV:', error);
    return { success: false, error: error.message || 'Error de conexión al subir el archivo.' };
  }
}

export async function deleteMiCv(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/egresados/me/cv/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al eliminar el archivo.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting CV:', error);
    return { success: false, error: error.message || 'Error de conexión al eliminar el archivo.' };
  }
}

export async function downloadMiCv(token: string, filename = 'Curriculum_UTH.pdf'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/egresados/me/cv/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error('Error downloading CV:', error);
    return false;
  }
}

export async function updateMiPerfilEgresado(
  token: string,
  data: Partial<{
    telefono_celular: string;
    telefono_casa: string;
    domicilio: string;
    habilidades: string;
    capacidades_especiales: string;
    nivel_estudios: 'TSU' | 'ING_LIC' | 'MTRIA';
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
  }>
): Promise<{ success: boolean; profile?: EgresadoProfile; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/egresados/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      const errorMsg = resData.detail || (Array.isArray(resData) && resData[0]) || Object.values(resData)[0] || 'Error al actualizar el perfil.';
      return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) };
    }

    return { success: true, profile: resData };
  } catch (error: any) {
    console.error('Error updating perfil egresado:', error);
    return { success: false, error: error.message || 'Error de conexión al actualizar el perfil.' };
  }
}

export interface IdiomaCatalogo {
  id: number;
  nombre: string;
}

export interface EmpresaProfile {
  id: number;
  user: number;
  nombre: string;
  domicilio: string;
  correo_contacto: string;
  actividad_de_la_empresa: string;
  campo: string | null;
  giro: string;
  sector: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  telefono_oficina?: string;
  telefono_celular?: string;
  nombre_contacto: string;
  cargo_contacto: string;
  logo?: string | null;
}

export interface RequisitoIdiomaInput {
  idioma: number;
  nivel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  obligatorio: boolean;
}

export interface NuevaVacanteData {
  titulo: string;
  area_estudio: number;
  tipo_contratacion: 'tiempo_completo' | 'indeterminado' | 'temporal' | 'medio_tiempo';
  modalidad: 'presencial' | 'home_office' | 'hibrido';
  num_candidatos: number;
  horario_trabajo: string;
  nivel_estudios: 'TSU' | 'ING_LIC' | 'MTRIA';
  edad?: string;
  genero?: 'masculino' | 'femenino' | 'indistinto';
  estado_civil?: 'soltero' | 'casado' | 'indistinto';
  es_inclusiva?: boolean;
  capacidades_especiales?: string;
  experiencia: string;
  conocimientos: string;
  habilidades: string;
  actitudes: string;
  responsabilidades: string;
  sueldo_minimo?: number | string | null;
  sueldo_maximo?: number | string | null;
  salario_a_tratar?: boolean;
  prestaciones: string;
  incluye_transporte?: boolean;
  incluye_comedor?: boolean;
  documentos_requeridos: string;
  persona_contacto: string;
  entrevistador?: string;
  observaciones?: string;
  idiomas?: RequisitoIdiomaInput[];
}

export interface VacanteEmpresaItem {
  id: number;
  clave_vacante: string;
  titulo: string;
  empresa: number;
  empresa_nombre: string;
  empresa_logo?: string | null;
  area_estudio: number;
  area_estudio_nombre: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cerrada';
  fecha_registro: string;
  tipo_contratacion: string;
  modalidad: string;
  num_candidatos: number;
  horario_trabajo: string;
  nivel_estudios: string;
  sueldo_minimo: string | null;
  sueldo_maximo: string | null;
  salario_a_tratar: boolean;
  num_postulaciones: number;
}

export async function fetchIdiomas(): Promise<IdiomaCatalogo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/core/idiomas/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching idiomas:', error);
    return [];
  }
}

export async function fetchMiPerfilEmpresa(token: string): Promise<EmpresaProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/empresas/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching perfil empresa:', error);
    return null;
  }
}

export async function updateMiPerfilEmpresa(
  token: string,
  payload: FormData | Record<string, any>
): Promise<{ success: boolean; profile?: EmpresaProfile; error?: string }> {
  try {
    const isFormData = payload instanceof FormData;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/profiles/empresas/me/`, {
      method: 'PATCH',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const resData = await res.json();
    if (!res.ok) {
      const errorMsg = resData.detail || (Array.isArray(resData) && resData[0]) || Object.values(resData)[0] || 'Error al actualizar el perfil de la empresa.';
      return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) };
    }

    return { success: true, profile: resData };
  } catch (error: any) {
    console.error('Error updating perfil empresa:', error);
    return { success: false, error: error.message || 'Error de conexión al actualizar el perfil.' };
  }
}

export async function fetchMisVacantes(token: string): Promise<VacanteEmpresaItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/mis-vacantes/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching mis vacantes:', error);
    return [];
  }
}

export async function crearVacante(
  token: string,
  data: NuevaVacanteData
): Promise<{ success: boolean; vacante?: VacanteEmpresaItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      // Tomar primer mensaje de error
      const firstError = Object.values(resData)[0];
      const errorMsg = Array.isArray(firstError) ? firstError[0] : (typeof firstError === 'string' ? firstError : 'Error al registrar la vacante.');
      return { success: false, error: errorMsg };
    }

    return { success: true, vacante: resData };
  } catch (error: any) {
    console.error('Error creating vacante:', error);
    return { success: false, error: error.message || 'Error de conexión al registrar la vacante.' };
  }
}

export async function cerrarVacante(
  token: string,
  vacanteId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/${vacanteId}/cerrar-vacante/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al cerrar la vacante.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error closing vacante:', error);
    return { success: false, error: error.message || 'Error de conexión al cerrar la vacante.' };
  }
}

export async function fetchPostulacionesEmpresa(
  accessToken: string,
  vacanteId?: number
): Promise<Postulacion[]> {
  try {
    const url = new URL(`${API_BASE_URL}/vacantes/postulaciones/`);
    if (vacanteId) {
      url.searchParams.append('vacante', String(vacanteId));
    }

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(`Error fetching postulaciones empresa: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching postulaciones empresa:', error);
    return [];
  }
}

export async function downloadCvCandidato(
  accessToken: string,
  egresadoId: number,
  nombreArchivo?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/egresados/${egresadoId}/cv/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(`Error downloading candidate CV: HTTP ${res.status}`);
      return false;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo || `CV_Candidato_${egresadoId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error('Error downloading candidate CV:', error);
    return false;
  }
}

export async function evaluarPostulacion(
  accessToken: string,
  postulacionId: number,
  estado: 'Aceptada' | 'Rechazada'
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/postulaciones/${postulacionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMsg = data.estado?.[0] || data.detail || 'Error al actualizar el estado del candidato.';
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error evaluando postulacion:', error);
    return { success: false, error: error.message || 'Error de conexión al evaluar al candidato.' };
  }
}

export interface EmpresaListItem {
  id: number;
  user: number;
  nombre: string;
  domicilio: string;
  correo_contacto: string;
  actividad_de_la_empresa: string;
  campo?: string | null;
  giro: string;
  sector: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  telefono_oficina?: string | null;
  telefono_celular?: string | null;
  nombre_contacto: string;
  cargo_contacto: string;
}

export async function fetchAdminVacantes(
  accessToken: string,
  statusFilter?: string
): Promise<Vacante[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'todas') {
      params.append('status', statusFilter);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/vacantes/${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching admin vacantes:', error);
    return [];
  }
}

export async function cambiarStatusVacante(
  accessToken: string,
  vacanteId: number,
  nuevoStatus: 'aprobada' | 'rechazada' | 'pendiente' | 'cerrada'
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/${vacanteId}/cambiar_status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: nuevoStatus }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al actualizar estatus de vacante.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error cambiando status vacante:', error);
    return { success: false, error: error.message || 'Error de conexión.' };
  }
}

export async function fetchAdminPostulaciones(
  accessToken: string,
  estadoFilter?: string
): Promise<Postulacion[]> {
  try {
    const params = new URLSearchParams();
    if (estadoFilter && estadoFilter !== 'todas') {
      params.append('estado', estadoFilter);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/vacantes/postulaciones/${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching admin postulaciones:', error);
    return [];
  }
}

export async function turnarPostulacionEmpresa(
  accessToken: string,
  postulacionId: number,
  notasUth?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/postulaciones/${postulacionId}/aprobar-uth/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ notas_uth: notasUth || '' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al turnar candidato a la empresa.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error turnando postulacion:', error);
    return { success: false, error: error.message || 'Error de conexión.' };
  }
}

export async function rechazarPostulacionUth(
  accessToken: string,
  postulacionId: number,
  notasUth?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/postulaciones/${postulacionId}/rechazar-uth/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ notas_uth: notasUth || '' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al descartar la postulación.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error descartando postulacion:', error);
    return { success: false, error: error.message || 'Error de conexión.' };
  }
}

export async function fetchAdminEmpresas(
  accessToken: string,
  statusFilter?: string
): Promise<EmpresaListItem[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'todas') {
      params.append('status', statusFilter);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/profiles/empresas/${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching admin empresas:', error);
    return [];
  }
}

export async function cambiarStatusEmpresa(
  accessToken: string,
  empresaId: number,
  nuevoStatus: 'aprobada' | 'rechazada' | 'pendiente'
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/empresas/${empresaId}/cambiar_status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: nuevoStatus }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || 'Error al actualizar estatus de empresa.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error cambiando status empresa:', error);
    return { success: false, error: error.message || 'Error de conexión.' };
  }
}

export interface PadronEgresadoItem {
  id: number;
  matricula: string;
  nombre: string;
  carrera: string;
  periodo?: string | null;
  anio_egreso?: string | null;
  estatus_titulacion?: string | null;
  estatus_tsu?: string | null;
  etnia_indigena?: string | null;
  discapacidad?: string | null;
  genero?: string | null;
  nivel?: string | null;
  tel_escolares?: string | null;
  correo_escolares?: string | null;
  domicilio?: string | null;
  estado_domicilio?: string | null;
  municipio?: string | null;
  curp?: string | null;
  fecha_nacimiento?: string | null;
  trabaja_actualmente?: string | null;
  correo_personal?: string | null;
  telefono_movil?: string | null;
  fecha_importacion: string;
}

export interface ImportarPadronResponse {
  mensaje: string;
  total_filas_procesadas: number;
  creados: number;
  actualizados: number;
  omitidos: number;
}

export async function fetchPadronEgresados(
  accessToken: string,
  search?: string
): Promise<PadronEgresadoItem[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const queryString = params.toString();
    const url = `${API_BASE_URL}/profiles/padron/${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching padron egresados:', error);
    return [];
  }
}

export async function importarPadronExcel(
  accessToken: string,
  file: File
): Promise<{ success: boolean; data?: ImportarPadronResponse; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('archivo', file);

    const res = await fetch(`${API_BASE_URL}/profiles/padron/importar/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.archivo || data.detail || (Array.isArray(data) && data[0]) || 'Error al procesar el archivo Excel del padrón.';
      return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) };
    }

    return { success: true, data: data as ImportarPadronResponse };
  } catch (error: any) {
    console.error('Error importando padron excel:', error);
    return { success: false, error: error.message || 'Error de conexión al cargar archivo.' };
  }
}

export async function descargarReporteColocacionExcel(
  accessToken: string
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/vacantes/colocaciones/exportar-excel/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || 'No se pudo generar el reporte de colocación en el servidor.',
      };
    }

    const blob = await res.blob();
    const contentDisposition = res.headers.get('content-disposition');
    let filename = `Reporte_Colocacion_Laboral_UTH_${new Date().toISOString().slice(0, 10)}.xlsx`;
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    // Disparar descarga en el navegador
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  } catch (error: any) {
    console.error('Error descargando reporte de colocación:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión al descargar el reporte.',
    };
  }
}


