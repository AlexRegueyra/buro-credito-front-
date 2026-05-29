import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate('/dashboard');
  };

  const handleGoBack = () => {
    void navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(252, 70, 107, 0.3), transparent 50%)',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial="initial" animate="animate" variants={bounceVariant}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Número 404 grande */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem', md: '12rem' },
                fontWeight: 900,
                color: 'white',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                lineHeight: 1,
              }}
            >
              404
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
              Página No Encontrada
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 500,
                textShadow: '0 1px 5px rgba(0,0,0,0.1)',
              }}
            >
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </Typography>

            {/* Botones */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Ir al Inicio
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Volver Atrás
              </Button>
            </Stack>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
