import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../useAuth';
import { useSession } from '../useSession';

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockLogout = vi.fn();

describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup useAuth mock
    vi.mocked(useAuth).mockReturnValue({
      logout: mockLogout,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      initialize: vi.fn(),
      login: vi.fn(),
      checkSession: vi.fn().mockResolvedValue(false),
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    });

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('session initialization', () => {
    it('should initialize session when not present', () => {
      renderHook(() => useSession());

      const state = useAuthStore.getState();
      expect(state.session).toBeDefined();
      expect(state.session?.isActive).toBe(true);
    });

    it('should not reinitialize if session exists', () => {
      const existingSession = {
        isActive: true,
        expiresAt: Date.now() + 900000,
        lastActivity: Date.now(),
        warningThreshold: 2,
      };

      useAuthStore.setState({ session: existingSession });

      renderHook(() => useSession());

      const state = useAuthStore.getState();
      expect(state.session).toEqual(existingSession);
    });

    it('should use custom inactivity timeout', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      renderHook(() => useSession({ inactivityTimeout: 30 }));

      const state = useAuthStore.getState();
      expect(state.session?.expiresAt).toBe(now + 30 * 60 * 1000);
    });
  });

  describe('activity detection', () => {
    it('should listen to user activity events', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useSession());

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should update last activity on user interaction', () => {
      renderHook(() => useSession());

      const initialActivity = useAuthStore.getState().session?.lastActivity ?? 0;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Trigger mousedown event
      act(() => {
        window.dispatchEvent(new MouseEvent('mousedown'));
      });

      const newActivity = useAuthStore.getState().session?.lastActivity ?? 0;
      expect(newActivity).toBeGreaterThan(initialActivity);
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useSession());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
  });

  describe('inactivity timeout', () => {
    it('should show warning before timeout', () => {
      const onWarning = vi.fn();

      const { result } = renderHook(() =>
        useSession({
          inactivityTimeout: 5,
          warningBeforeTimeout: 2,
          onWarning,
        })
      );

      expect(result.current.showWarning).toBe(false);

      // Advance time to warning threshold (3 minutes elapsed, 2 minutes remaining)
      act(() => {
        vi.advanceTimersByTime(3 * 60 * 1000 + 1000);
      });

      expect(result.current.showWarning).toBe(true);
      expect(onWarning).toHaveBeenCalled();
    });

    it('should logout on inactivity timeout', () => {
      const onInactive = vi.fn();

      renderHook(() =>
        useSession({
          inactivityTimeout: 5,
          onInactive,
        })
      );

      // Advance time past timeout (5 minutes + 1 second)
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000 + 1000);
      });

      expect(onInactive).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should update timeRemaining countdown', () => {
      const { result } = renderHook(() =>
        useSession({
          inactivityTimeout: 5,
        })
      );

      const initialTime = result.current.timeRemaining;
      expect(initialTime).toBe(5 * 60);

      // Advance 1 minute
      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });

      expect(result.current.timeRemaining).toBe(4 * 60);
    });
  });

  describe('extendSession', () => {
    it('should extend session and clear warning', () => {
      const { result } = renderHook(() =>
        useSession({
          inactivityTimeout: 5,
          warningBeforeTimeout: 2,
        })
      );

      // Advance to warning state
      act(() => {
        vi.advanceTimersByTime(3 * 60 * 1000 + 1000);
      });

      expect(result.current.showWarning).toBe(true);

      // Extend session
      act(() => {
        result.current.extendSession();
      });

      expect(result.current.showWarning).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useSession());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
