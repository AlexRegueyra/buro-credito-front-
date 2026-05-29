import { Box, Stack, Typography } from '@mui/material';

import { LoginButton } from '@features/auth';
import { config } from '@lib/config';

export function LandingPage() {
  return (

    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',

        // 🔥 Imagen de fondo desde /public
        backgroundImage: `url(${import.meta.env.BASE_URL}images/backgrounds/keycloak-bg.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',

        // Opcional: mejora contraste si colocas formularios encima
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // puedes ajustar opacidad
      }}
    >




      <Stack spacing={4} alignItems="center">

        {/* Título */}
        <Stack spacing={6} alignItems="center" sx={{ textAlign: 'center', mb: 6 }}>
  <Box
    component="img"
    src={`${import.meta.env.BASE_URL}images/logos/logo_bmx_nf.webp`}
    alt="Bancomext / Nacional Financiera"
    sx={{
      fontWeight: 700,
      fontSize: { xs: '2rem', md: '3rem' },
      height: 'auto',
      opacity: 0.95,
    }}
  />

  <Box
    component="img"
    src={`${import.meta.env.BASE_URL}images/logos/porta_6.png`}
    alt="Icono"
    sx={{
      fontWeight: 700,
      fontSize: { xs: '2rem', md: '3rem' },
      height: 'auto',
      opacity: 0.95,
      // ❌ mt: 30 eliminado
    }}
  />
</Stack>



        {/* Botón de Login */}
        <LoginButton
          variant="contained"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3888a7 0%, #3888a7 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00678a 0%, #00678a 100%)',
            },
            maxWidth: 400,
          }}
        >
          Iniciar Sesión
        </LoginButton>

        {/* Footer */}
        <Stack spacing={1} sx={{ pt: 2 }}>
          <Typography variant="caption" color="text.contrastText" align="center">
            Versión {config.appVersion}
          </Typography>
          <Typography variant="caption" color="text.contrastText" align="center">
            © {new Date().getFullYear()} Unidad de Tecnologías de la Información. Todos los derechos reservados.
          </Typography>
        </Stack>
      </Stack>


    </Box>
  );
}
