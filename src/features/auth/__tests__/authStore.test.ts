import { describe, it, expect, beforeEach } from 'vitest';

import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should set user and mark as authenticated', () => {
    const mockUser: User = {
      usrId: '123',
      usrNombre: 'Test User',
      usrEmail: 'test@example.com',
      usrEstatus: 'A',
      rolId: 'admin',
      permissions: ['read', 'write'],
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth state', () => {
    const mockUser: User = {
      usrId: '123',
      usrNombre: 'Test User',
      usrEmail: 'test@example.com',
      usrEstatus: 'A',
      rolId: 'admin',
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should check permissions correctly', () => {
    const mockUser: User = {
      usrId: '123',
      usrNombre: 'Test User',
      usrEmail: 'test@example.com',
      usrEstatus: 'A',
      rolId: 'admin',
      permissions: ['read', 'write', 'delete'],
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.hasPermission('read')).toBe(true);
    expect(state.hasPermission('execute')).toBe(false);
    expect(state.hasAnyPermission(['read', 'execute'])).toBe(true);
    expect(state.hasAllPermissions(['read', 'write'])).toBe(true);
    expect(state.hasAllPermissions(['read', 'execute'])).toBe(false);
  });

  it('should check role correctly', () => {
    const mockUser: User = {
      usrId: '123',
      usrNombre: 'Test User',
      usrEmail: 'test@example.com',
      usrEstatus: 'A',
      rolId: 'admin',
      role: {
        rolId: 'admin',
        rolNombre: 'Administrator',
      },
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.hasRole('admin')).toBe(true);
    expect(state.hasRole('user')).toBe(false);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
