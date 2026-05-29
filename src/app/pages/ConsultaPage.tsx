import { Container, Typography } from '@mui/material';

export function ConsultaPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" color="text.secondary" gutterBottom>
        Consultar Buró de Crédito
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí irá el formulario de consulta PM / PFAE.
      </Typography>
    </Container>
  );
}
