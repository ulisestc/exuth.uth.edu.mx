'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  LoginCredentials,
  TokenResponse,
  loginRequest,
  fetchCurrentUser,
  saveAuthTokens,
  saveUserData,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  clearAuthSession,
  refreshAccessToken,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate session on client mount
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = getStoredAccessToken();
        const storedUser = getStoredUser();

        if (storedToken) {
          setAccessToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
          }

          // Verify/update profile in background
          try {
            const freshUser = await fetchCurrentUser(storedToken);
            setUser(freshUser);
            saveUserData(freshUser);
          } catch {
            // Token might be expired, try refreshing
            const refreshToken = getStoredRefreshToken();
            if (refreshToken) {
              try {
                const newAccess = await refreshAccessToken(refreshToken);
                setAccessToken(newAccess);
                const freshUser = await fetchCurrentUser(newAccess);
                setUser(freshUser);
                saveAuthTokens({ access: newAccess, refresh: refreshToken });
                saveUserData(freshUser);
              } catch {
                clearAuthSession();
                setUser(null);
                setAccessToken(null);
              }
            } else {
              clearAuthSession();
              setUser(null);
              setAccessToken(null);
            }
          }
        }
      } catch (err) {
        console.error('Error hydrating auth state:', err);
        clearAuthSession();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      // 1. Obtener tokens JWT de Djoser
      const tokens: TokenResponse = await loginRequest(credentials);
      
      // 2. Guardar tokens en cookies y storage
      saveAuthTokens(tokens);
      setAccessToken(tokens.access);

      // 3. Obtener perfil completo y rol del usuario
      const profile = await fetchCurrentUser(tokens.access);
      saveUserData(profile);
      setUser(profile);

      return { success: true, user: profile };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión. Revisa tus credenciales.' 
      };
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setAccessToken(null);
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    try {
      const freshUser = await fetchCurrentUser(accessToken);
      setUser(freshUser);
      saveUserData(freshUser);
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
