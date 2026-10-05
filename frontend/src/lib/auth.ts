import type { RegistroEgresadoData, RegistroEmpresaData } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export type UserRole = 'egresado' | 'empresa' | 'admin_uth' | 'soporte_ti';

export interface AuthUser {
  id: number;
  email: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rol: UserRole;
  is_active: boolean;
  deactivated_at: string | null;
  date_joined: string;
  last_login: string | null;
  acepta_aviso_privacidad?: boolean;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const ACCESS_TOKEN_KEY = 'uth_access_token';
const REFRESH_TOKEN_KEY = 'uth_refresh_token';
const USER_DATA_KEY = 'uth_user_data';

// --- Cookie helpers ---
export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// --- Storage helpers ---
export function saveAuthTokens(tokens: TokenResponse) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  setCookie(ACCESS_TOKEN_KEY, tokens.access, 1);
  setCookie(REFRESH_TOKEN_KEY, tokens.refresh, 7);
}

export function saveUserData(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  setCookie('uth_user_role', user.rol, 7);
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  deleteCookie('uth_user_role');
}

// --- API Requests ---
export async function loginRequest(credentials: LoginCredentials): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/jwt/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.detail || 
      (data.non_field_errors && data.non_field_errors[0]) ||
      'Credenciales incorrectas o cuenta inactiva. Verifica tu correo y contraseña.';
    throw new Error(errorMsg);
  }

  return data as TokenResponse;
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/users/me/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo perfil: HTTP ${res.status}`);
  }

  return (await res.json()) as AuthUser;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Sesión expirada');
  }

  const data = await res.json();
  return data.access;
}

export function getRoleRedirectPath(role: UserRole, returnUrl?: string | null): string {
  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  switch (role) {
    case 'egresado':
      return '/portal-egresado';
    case 'empresa':
      return '/portal-empresa';
    case 'admin_uth':
    case 'soporte_ti':
      return '/admin-uth';
    default:
      return '/';
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'egresado':
      return 'Egresado UTH';
    case 'empresa':
      return 'Empresa Vinculada';
    case 'admin_uth':
      return 'Administrador UTH';
    case 'soporte_ti':
      return 'Soporte TI / Admin';
    default:
      return 'Usuario';
  }
}

export async function registerEgresado(data: RegistroEgresadoData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const userRes = await fetch(`${API_BASE_URL}/auth/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email.trim(),
        password: data.password,
        nombres: data.nombres.trim(),
        apellido_paterno: data.apellido_paterno.trim(),
        apellido_materno: data.apellido_materno.trim(),
        rol: 'egresado',
        acepta_aviso_privacidad: data.acepta_aviso_privacidad,
      }),
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      const errorMsg = userData.email?.[0] || userData.password?.[0] || (userData.non_field_errors && userData.non_field_errors[0]) || 'Error al crear la cuenta de usuario.';
      return { success: false, error: errorMsg };
    }

    const tokens = await loginRequest({ email: data.email.trim(), password: data.password });
    saveAuthTokens(tokens);

    const profileRes = await fetch(`${API_BASE_URL}/profiles/egresados/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      },
      body: JSON.stringify({
        matricula: data.matricula.trim(),
        curp: data.curp.trim().toUpperCase(),
        carrera: data.carrera,
        nivel_estudios: data.nivel_estudios,
        genero: data.genero,
        telefono_celular: data.telefono_celular.trim(),
        domicilio: data.domicilio.trim(),
        habilidades: data.habilidades.trim(),
      }),
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok) {
      const errorMsg = profileData.matricula?.[0] || profileData.curp?.[0] || profileData.detail || 'Error al vincular los datos académicos del egresado.';
      return { success: false, error: errorMsg };
    }

    const fullUser = await fetchCurrentUser(tokens.access);
    saveUserData(fullUser);

    return { success: true, user: fullUser };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Error de conexión durante el registro institucional.' };
  }
}

export async function registerEmpresa(data: RegistroEmpresaData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const userRes = await fetch(`${API_BASE_URL}/auth/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email.trim(),
        password: data.password,
        nombres: data.nombres.trim(),
        apellido_paterno: data.apellido_paterno.trim(),
        apellido_materno: data.apellido_materno.trim(),
        rol: 'empresa',
        acepta_aviso_privacidad: data.acepta_aviso_privacidad,
      }),
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      const errorMsg = userData.email?.[0] || userData.password?.[0] || (userData.non_field_errors && userData.non_field_errors[0]) || 'Error al crear la cuenta empresarial.';
      return { success: false, error: errorMsg };
    }

    const tokens = await loginRequest({ email: data.email.trim(), password: data.password });
    saveAuthTokens(tokens);

    const profileRes = await fetch(`${API_BASE_URL}/profiles/empresas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      },
      body: JSON.stringify({
        nombre: data.nombre.trim(),
        domicilio: data.domicilio.trim(),
        correo_contacto: data.correo_contacto.trim(),
        actividad_de_la_empresa: data.actividad_de_la_empresa.trim(),
        giro: data.giro,
        sector: data.sector,
        nombre_contacto: data.nombre_contacto.trim(),
        cargo_contacto: data.cargo_contacto.trim(),
        telefono_oficina: data.telefono_oficina?.trim(),
        telefono_celular: data.telefono_celular?.trim(),
      }),
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok) {
      const errorMsg = profileData.nombre?.[0] || profileData.correo_contacto?.[0] || profileData.detail || 'Error al vincular el perfil de empresa.';
      return { success: false, error: errorMsg };
    }

    const fullUser = await fetchCurrentUser(tokens.access);
    saveUserData(fullUser);

    return { success: true, user: fullUser };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Error de conexión durante el registro empresarial.' };
  }
}
