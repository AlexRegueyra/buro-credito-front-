import { Container, Typography } from '@mui/material';

export function HistorialPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" color="text.secondary" gutterBottom>
        Historial de Consultas
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí irá el historial de consultas por RFC.
      </Typography>
    </Container>
  );
}
