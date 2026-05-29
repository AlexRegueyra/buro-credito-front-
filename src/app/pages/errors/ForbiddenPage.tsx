import { Home as HomeIcon, Lock as LockIcon } from '@mui/icons-material';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const bounceVariant = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      bounce: 0.5,
      duration: 0.8,
    },
  },
};

const lockVariant = {
  initial: { rotate: 0 },
  animate: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      delay: 0.5,
    },
  },
};

export function ForbiddenPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(240, 147, 251, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(245, 87, 108, 0.3), transparent 50%)',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial="initial" animate="animate" variants={bounceVariant}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Icono de candado */}
            <motion.div variants={lockVariant}>
              <Box
                sx={{
                  width: { xs: 120, sm: 150, md: 180 },
                  height: { xs: 120, sm: 150, md: 180 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <LockIcon
                  sx={{
                    fontSize: { xs: 60, sm: 80, md: 100 },
                    color: 'white',
                  }}
                />
              </Box>
            </motion.div>

            {/* Código 403 */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                fontWeight: 900,
                color: 'white',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                lineHeight: 1,
              }}
            >
              403
            </Typography>

            {/* Mensaje */}
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 600,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Acceso Denegado
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 500,
                textShadow: '0 1px 5px rgba(0,0,0,0.1)',
              }}
            >
              No tienes los permisos necesarios para acceder a esta página. Si crees que esto es un
              error, contacta al administrador del sistema.
            </Typography>

            {/* Botón */}
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                mt: 4,
                bgcolor: 'white',
                color: 'error.main',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Volver al Inicio
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
