import { useCallback } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

import { useSession } from '../hooks';

interface SessionTimerProps {
  /**
   * Tiempo de inactividad en minutos
   * @default 15
   */
  inactivityTimeout?: number;

  /**
   * Minutos antes del timeout para mostrar advertencia
   * @default 2
   */
  warningBeforeTimeout?: number;
}

export function SessionTimer({
  inactivityTimeout = 15,
  warningBeforeTimeout = 2,
}: SessionTimerProps) {
  const { showWarning, timeRemaining, extendSession } = useSession({
    inactivityTimeout,
    warningBeforeTimeout,
    onWarning: () => {
      console.warn('Sesión por expirar');
    },
    onInactive: () => {
      console.warn('Sesión expirada por inactividad');
    },
  });

  const handleExtend = useCallback(() => {
    extendSession();
  }, [extendSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins)}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showWarning} disableEscapeKeyDown>
      <DialogTitle>Sesión por Expirar</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.comment" gutterBottom>
            Tu sesión está por expirar por inactividad
          </Typography>
          <Typography variant="h3" color="error" sx={{ my: 2 }}>
            {formatTime(timeRemaining)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¿Deseas continuar con tu sesión?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleExtend} variant="contained" color="primary" fullWidth>
          Continuar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
}
