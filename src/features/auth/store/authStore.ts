/**
 * Store de autenticación del cliente (BFF mode).
 *
 * ANTES: Guardaba tokens (AuthTokens) en memoria de Zustand y persistía en localStorage.
 * AHORA: Solo guarda el perfil del usuario. Persiste en sessionStorage (se limpia al
 *        cerrar el tab). Los tokens viven en el BFF — el cliente nunca los ve.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

import type { User, SessionInfo } from '../types';

interface AuthState {
  // ── Estado ────────────────────────────────────────────────────────────────
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: SessionInfo | null;

  // ── Acciones ──────────────────────────────────────────────────────────────
  setUser: (user: User | null) => void;
  setSession: (session: SessionInfo) => void;
  updateLastActivity: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // ── Verificación de permisos ──────────────────────────────────────────────
  hasPermission: (permission: string) => boolean;
  hasRole: (roleId: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Estado inicial ─────────────────────────────────────────────────
        user: null,
        isAuthenticated: false,
        isLoading: true,  // spinner hasta que initialize() resuelva
        session: null,

        // ── Acciones ───────────────────────────────────────────────────────
        setUser: (user) => set({ user, isAuthenticated: !!user }),

        setSession: (session) => set({ session }),

        updateLastActivity: () => {
          const { session } = get();
          if (session) {
            set({ session: { ...session, lastActivity: Date.now() } });
          }
        },

        clearAuth: () =>
          set({
            user: null,
            isAuthenticated: false,
            session: null,
          }),

        setLoading: (isLoading) => set({ isLoading }),

        // ── Permisos ───────────────────────────────────────────────────────
        hasPermission: (permission) => {
          const { user } = get();
          return user?.permissions?.includes(permission) ?? false;
        },

        hasRole: (roleId) => {
          const { user } = get();
          return user?.role?.rolId === roleId || user?.rolId === roleId;
        },

        hasAnyPermission: (permissions) => {
          const { user } = get();
          return permissions.some((p) => user?.permissions?.includes(p) ?? false);
        },

        hasAllPermissions: (permissions) => {
          const { user } = get();
          return permissions.every((p) => user?.permissions?.includes(p) ?? false);
        },
      }),
      {
        name: 'auth-store',
        // sessionStorage: roles no quedan expuestos al cerrar el tab
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    // enabled: false en prod — el Redux DevTools no puede inspeccionar el store
    { name: 'Auth Store', enabled: import.meta.env.DEV },
  ),
);
