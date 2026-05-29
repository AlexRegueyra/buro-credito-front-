import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as bff from '@lib/keycloak';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../useAuth';
import type { ServerUserInfo } from '@shared/types/auth.server.types';

// Mock del stub BFF (src/lib/keycloak.ts en modo BFF)
vi.mock('@lib/keycloak');
vi.mock('@features/audit/api/useAuditLogs', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

const mockBff = vi.mocked(bff);

const mockServerUser: ServerUserInfo = {
  userId: 'testuser',
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  primaryRole: 'UAF',
  keycloakId: 'kc-sub-123',
  permissions: ['UAF'],
};

describe('useAuth (BFF mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });
  });

  describe('initialize', () => {
    it('popula el store cuando el BFF devuelve un usuario', async () => {
      mockBff.fetchCurrentUser.mockResolvedValue(mockServerUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.usrId).toBe('testuser');
      expect(result.current.user?.rolId).toBe('UAF');
      expect(result.current.user?.permissions).toContain('UAF');
    });

    it('limpia el store cuando el BFF devuelve null (sin sesión)', async () => {
      mockBff.fetchCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('limpia el store si fetchCurrentUser lanza error', async () => {
      mockBff.fetchCurrentUser.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('gestiona isLoading correctamente', () => {
      let resolveUser!: (v: ServerUserInfo | null) => void;
      mockBff.fetchCurrentUser.mockReturnValue(
        new Promise<ServerUserInfo | null>((res) => { resolveUser = res; }),
      );

      const { result } = renderHook(() => useAuth());

      act(() => { void result.current.initialize(); });
      expect(result.current.isLoading).toBe(true);

      act(() => { resolveUser(mockServerUser); });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('llama a bff.login() para redirigir al BFF', () => {
      const { result } = renderHook(() => useAuth());
      result.current.login();
      expect(mockBff.login).toHaveBeenCalledOnce();
    });
  });

  describe('logout', () => {
    it('limpia el store y llama a bff.logout()', async () => {
      mockBff.logout.mockResolvedValue(undefined);

      useAuthStore.setState({
        user: {
          usrId: 'testuser',
          usrNombre: 'Test',
          usrEmail: 'test@example.com',
          usrEstatus: 'A',
          rolId: 'UAF',
        },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(mockBff.logout).toHaveBeenCalledOnce();
    });
  });

  describe('checkSession', () => {
    it('devuelve true y actualiza el store si hay sesión activa', async () => {
      mockBff.fetchCurrentUser.mockResolvedValue(mockServerUser);

      const { result } = renderHook(() => useAuth());
      let sessionActive: boolean | undefined;

      await act(async () => {
        sessionActive = await result.current.checkSession();
      });

      expect(sessionActive).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('devuelve false y limpia el store si la sesión expiró', async () => {
      mockBff.fetchCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      let sessionActive: boolean | undefined;

      await act(async () => {
        sessionActive = await result.current.checkSession();
      });

      expect(sessionActive).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('hasPermission / hasRole', () => {
    it('evalúa permisos correctamente desde el store', async () => {
      mockBff.fetchCurrentUser.mockResolvedValue(mockServerUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.hasPermission('UAF')).toBe(true);
      expect(result.current.hasPermission('TMF')).toBe(false);
      expect(result.current.hasRole('UAF')).toBe(true);
    });
  });
});
