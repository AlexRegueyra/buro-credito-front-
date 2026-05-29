import { useEffect } from 'react';

import { CircularProgress, Box } from '@mui/material';

import { useAuth } from '../hooks';

interface AuthProviderProps {
  children: React.ReactNode;
  /**
   * Componente a mostrar mientras se inicializa la autenticación
   */
  fallback?: React.ReactNode;
}

export function AuthProvider({ children, fallback }: AuthProviderProps) {
  const { initialize, isLoading } = useAuth();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      fallback ?? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      )
    );
  }

  return <>{children}</>;
}
