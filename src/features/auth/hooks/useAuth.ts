/**
 * Hook principal de autenticación (BFF mode).
 *
 * ANTES: initialize() llamaba a keycloak.initKeycloak() → tokens visibles en Network.
 * AHORA: initialize() llama a fetchCurrentUser() → GET /x-me con cookie HttpOnly.
 *
 * El mapeo ServerUserInfo → User mantiene el contrato del authStore intacto:
 * ningún componente, hook ni test de UI necesita cambiar.
 */

import { useCallback } from 'react';

import * as bff from '@lib/keycloak';
import type { ServerUserInfo } from '@shared/types/auth.server.types';

import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

// ─── Mapeo ServerUserInfo → User (authStore) ──────────────────────────────────
//
// Este mapeo es el "Zustand Bridge": convierte la respuesta del BFF (/x-me)
// al tipo User que el authStore y todos los componentes ya conocen.
// El contrato del authStore NO cambia — solo cambia el origen de los datos.

function mapServerUserToUser(info: ServerUserInfo): User {
  // exactOptionalPropertyTypes exige omitir el campo en lugar de asignar undefined
  const base = {
    usrId: info.userId,
    usrNombre: info.displayName || info.username,
    usrEmail: info.email,
    usrEstatus: 'A' as const,
    rolId: info.primaryRole,
    keycloakId: info.keycloakId,
    permissions: [...info.permissions],
  };

  if (!info.primaryRole) return base;

  return {
    ...base,
    role: { rolId: info.primaryRole, rolNombre: info.primaryRole },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    clearAuth,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore();

  /**
   * Inicializa la autenticación consultando el BFF.
   *
   * ANTES: keycloak.initKeycloak() → keycloak-js → tokens en Network.
   * AHORA: GET /x-me con cookie __sid → si hay sesión válida, popula el store.
   *
   * Llamado una sola vez en AuthProvider.tsx al montar la app.
   */
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      const serverUser = await bff.fetchCurrentUser();

      if (serverUser) {
        setUser(mapServerUserToUser(serverUser));
      } else {
        // No hay sesión activa en el BFF → usuario no autenticado
        clearAuth();
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, clearAuth]);

  /**
   * Redirige al BFF para iniciar el flujo Authorization Code.
   * El BFF redirige a Keycloak — el browser nunca ve la URL interna.
   *
   * ANTES: keycloakInstance.login() → redirect directo a KC desde el browser.
   * AHORA: window.location.href = '/auth/login' → el BFF orquesta el resto.
   */
  const login = useCallback(() => {
    bff.login();
  }, []);

  /**
   * Cierra la sesión en el BFF (invalida cookie) y redirige a KC logout.
   *
   * ANTES: keycloak.logout() construía la URL de KC en el browser.
   * AHORA: POST /auth/logout → BFF construye la URL de KC → browser redirige.
   */
  const logout = useCallback(async () => {
    try {
      clearAuth();

      // Pequeña pausa para que Zustand persista el clearAuth antes del redirect
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      await bff.logout();
    } catch (error) {
      console.error('Error en logout:', error);
      // Fallback: limpiar store y redirigir manualmente
      clearAuth();
      const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
      window.location.href = projectName ? `/${projectName}/` : '/';
    }
  }, [clearAuth]);

  /**
   * Verifica si el usuario tiene sesión activa en el BFF.
   * Útil para comprobaciones silenciosas sin redirigir.
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    const serverUser = await bff.fetchCurrentUser();
    if (serverUser) {
      setUser(mapServerUserToUser(serverUser));
      return true;
    }
    clearAuth();
    return false;
  }, [setUser, clearAuth]);

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,

    // Acciones
    initialize,
    login,
    logout,
    checkSession,

    // Permisos (sin cambios — authStore los gestiona igual que antes)
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
}
