import { Box, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Ruta a redirigir si no está autenticado
   * @default '/'
   */
  redirectTo?: string;
  /**
   * Permisos requeridos (al menos uno)
   */
  requiredPermissions?: string[];
  /**
   * Rol requerido
   */
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/',
  requiredPermissions,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasAnyPermission, hasRole } = useAuth();

  // No autenticado - redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar permisos
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.comment">
          No tienes permisos para acceder a esta página
        </Typography>
      </Box>
    );
  }

  // Verificar rol
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.comment">
          No tienes el rol necesario para acceder a esta página
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
