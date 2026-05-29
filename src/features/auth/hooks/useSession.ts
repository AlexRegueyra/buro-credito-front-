import { useEffect, useState, useCallback } from 'react';

import { useAuthStore } from '../store/authStore';

import { useAuth } from './useAuth';

interface UseSessionOptions {
  /**
   * Tiempo de inactividad en minutos antes de cerrar sesión
   * @default 15
   */
  inactivityTimeout?: number;

  /**
   * Tiempo en minutos antes del timeout para mostrar advertencia
   * @default 2
   */
  warningBeforeTimeout?: number;

  /**
   * Callback cuando se detecta inactividad
   */
  onInactive?: () => void;

  /**
   * Callback cuando se muestra la advertencia
   */
  onWarning?: () => void;
}

export function useSession(options: UseSessionOptions = {}) {
  const {
    inactivityTimeout = 15,
    warningBeforeTimeout = 2,
    onInactive,
    onWarning,
  } = options;

  const { logout } = useAuth();
  const { session, setSession, updateLastActivity } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(inactivityTimeout * 60);

  /**
   * Inicializar sesión
   */
  useEffect(() => {
    if (!session) {
      const now = Date.now();
      setSession({
        isActive: true,
        expiresAt: now + inactivityTimeout * 60 * 1000,
        lastActivity: now,
        warningThreshold: warningBeforeTimeout,
      });
    }
  }, [session, setSession, inactivityTimeout, warningBeforeTimeout]);

  /**
   * Manejar actividad del usuario
   */
  const handleActivity = useCallback(() => {
    updateLastActivity();
    setShowWarning(false);
  }, [updateLastActivity]);

  /**
   * Eventos que detectan actividad
   */
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  /**
   * Monitorear inactividad
   */
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - session.lastActivity;
      const remaining = Math.max(0, inactivityTimeout * 60 - timeSinceActivity / 1000);

      setTimeRemaining(Math.floor(remaining));

      // Mostrar advertencia
      if (remaining <= warningBeforeTimeout * 60 && remaining > 0 && !showWarning) {
        setShowWarning(true);
        onWarning?.();
      }

      // Cerrar sesión por inactividad
      if (remaining <= 0) {
        onInactive?.();
        void logout();
      }
    }, 1000);

    return () => { clearInterval(interval); };
  }, [
    session,
    inactivityTimeout,
    warningBeforeTimeout,
    showWarning,
    onInactive,
    onWarning,
    logout,
  ]);

  /**
   * Extender sesión
   */
  const extendSession = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
  };
}
