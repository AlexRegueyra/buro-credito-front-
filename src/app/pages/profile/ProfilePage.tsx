import { useState } from 'react';

import {
  LockReset as LockResetIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Divider,
  Chip,
  Alert,
  Box,
  Snackbar,
} from '@mui/material';

import { useAuth } from '@features/auth';

export function ProfilePage() {
  const { user } = useAuth();
  const [emailResetSent, setEmailResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleCloseEmailNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setEmailResetSent(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Notificación de correo de reset enviado */}
      <Snackbar
        open={emailResetSent}
        autoHideDuration={6000}
        onClose={handleCloseEmailNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseEmailNotification} severity="success" variant="filled" sx={{ width: '100%' }}>
          📧 Se ha enviado un correo con las instrucciones para cambiar tu contraseña
        </Alert>
      </Snackbar>

      {/* Notificación de error */}
      <Snackbar
        open={Boolean(resetError)}
        autoHideDuration={6000}
        onClose={() => { setResetError(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => { setResetError(null); }} severity="error" variant="filled" sx={{ width: '100%' }}>
          {resetError}
        </Alert>
      </Snackbar>

      <Typography variant="h4" color="text.secondary" sx={{ mb: 2 }}>
        Mi Perfil
      </Typography>

      <Stack spacing={2}>
        {/* Información Personal - Centrada en la parte superior */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%', lg: '50%' } }}>
            <Card>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: 'primary.main',
                      fontSize: '3.5rem',
                    }}
                  >
                    {user?.usrNombre.charAt(0).toUpperCase() ?? 'U'}
                  </Avatar>

                  <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <Typography variant="h5" color="text.secondary">{user?.usrNombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.usrEmail}
                    </Typography>
                    {user?.role && (
                      <Chip
                        label={user.role.rolNombre}
                        color="primary"
                        size="small"
                        icon={<BadgeIcon />}
                      />
                    )}
                  </Stack>

                  <Box
                    sx={{
                      width: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center',
                      p: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => { setEmailResetSent(true); }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      <LockResetIcon color="primary" />
                      <Typography variant="body1" color="primary">
                        Cambiar contraseña
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Detalles del Usuario - Ancho completo debajo */}
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Información del Usuario
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      ID de Usuario
                    </Typography>
                    <Typography variant="body1" color="text.comment">{user?.usrId}</Typography>
                  </Stack>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body1" color="text.comment">{user?.usrEmail}</Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Rol
                    </Typography>
                    <Typography variant="body1" color="text.comment">
                      {user?.role?.rolNombre ?? user?.rolId ?? 'No asignado'}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Estado
                    </Typography>
                    <Chip
                      label={user?.usrEstatus === 'A' ? 'Activo' : 'Inactivo'}
                      color={user?.usrEstatus === 'A' ? 'success' : 'default'}
                      size="small"
                    />
                  </Stack>
                </Box>

                {user?.permissions && user.permissions.length > 0 && (
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Permisos
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
  {user.permissions.slice(0, 10).map((permission, index) => (
    <Chip
      key={index}
      label={permission}
      size="small"
      variant="outlined"
      sx={{
        color: 'text.comment',        // 🔥 color del texto
        borderColor: 'text.comment',  // opcional: borde con mismo color
      }}
    />
  ))}

  {user.permissions.length > 10 && (
    <Chip
      label={`+${String(user.permissions.length - 10)} más`}
      size="small"
      variant="outlined"
      sx={{
        color: 'text.comment',
        borderColor: 'text.comment',
      }}
    />
  )}
</Box>
                    </Stack>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
