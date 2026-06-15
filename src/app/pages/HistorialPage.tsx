import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { useHistorial, useHistorialDetalle } from '@features/buro/api/buroApi';
import { ResultadoBuro } from '@features/buro/components/ResultadoBuro';
import { BuroPreanalysisPanel } from '@features/buro/components/BuroPreanalysisPanel';
import type { ConsultaResumen } from '@features/buro/api/buroApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, { label: string; color: 'primary' | 'secondary' | 'default' }> = {
  REPORTE_PM:       { label: 'Reporte PM',       color: 'primary' },
  INFORME_BURO_PM:  { label: 'Informe Buró PM',  color: 'secondary' },
  PERFILADOR_PM:    { label: 'Perfilador PM',     color: 'default' },
  ALERTADOR_PM:     { label: 'Alertador PM',      color: 'default' },
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Dialog de detalle ────────────────────────────────────────────────────────

function DetalleDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const theme = useTheme();
  const { data, isLoading, isError } = useHistorialDetalle(id);

  return (
    <Dialog open maxWidth="lg" fullWidth onClose={onClose} scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="eva:file-text-fill" color="#fff" width={18} />
        </Box>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Detalle de consulta #{id}
          </Typography>
          {data && (
            <Typography variant="caption" color="text.secondary">
              RFC: {data.rfc ?? '—'} · {formatFecha(data.fechaConsulta)}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <Icon icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {isLoading && (
          <Box>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={48} sx={{ mb: 1 }} />
            ))}
          </Box>
        )}

        {isError && (
          <Alert severity="error" icon={<Icon icon="eva:alert-circle-fill" width={20} />}>
            No se pudo cargar el detalle de esta consulta.
          </Alert>
        )}

        {data?.respuesta && <ResultadoBuro data={data.respuesta} />}

        {data && <BuroPreanalysisPanel consultaId={id} />}

        {import.meta.env.DEV && data && (
          <Box component="details" sx={{ mt: 3 }}>
            <Box component="summary" sx={{ color: 'text.secondary', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
              <Icon icon="eva:code-fill" width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              JSON completo (DEV)
            </Box>
            <Box component="pre" sx={{ mt: 1.5, p: 2.5, borderRadius: 2, overflow: 'auto', background: '#1e1e2e', color: '#89b4fa', fontSize: '0.75rem', maxHeight: 400, lineHeight: 1.6 }}>
              {JSON.stringify(data.respuesta, null, 2)}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Fila ─────────────────────────────────────────────────────────────────────

function FilaHistorial({ row, onVer }: { row: ConsultaResumen; onVer: (id: number) => void }) {
  const tipo = TIPO_LABEL[row.tipoConsulta] ?? { label: row.tipoConsulta, color: 'default' as const };

  return (
    <TableRow hover sx={{ '&:last-child td': { border: 0 } }}>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', width: 64 }}>#{row.id}</TableCell>
      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}>
        {row.rfc ?? <Typography component="span" color="text.disabled" fontSize="0.85rem">Sin RFC</Typography>}
      </TableCell>
      <TableCell>
        <Chip label={tipo.label} color={tipo.color} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{formatFecha(row.fechaConsulta)}</TableCell>
      <TableCell align="right">
        <Tooltip title="Ver resultado completo">
          <Button size="small" variant="outlined" onClick={() => onVer(row.id)} startIcon={<Icon icon="eva:eye-fill" width={16} />} sx={{ minWidth: 80 }}>
            Ver
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function HistorialPage() {
  const theme = useTheme();
  const [rfcFiltro, setRfcFiltro] = useState<string | undefined>(undefined);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { register, handleSubmit, reset: resetForm } = useForm<{ rfc: string }>();
  const { data = [], isLoading, isError, refetch } = useHistorial(rfcFiltro);

  const onBuscar = ({ rfc }: { rfc: string }) => {
    setRfcFiltro(rfc.trim().toUpperCase() || undefined);
  };

  const onLimpiar = () => {
    resetForm();
    setRfcFiltro(undefined);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 3, pb: 2.5, borderBottom: '2px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0, background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="eva:clock-fill" width={22} color="#fff" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.dark" lineHeight={1.2}>
            Historial de Consultas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de todas las consultas realizadas a Buró de Crédito
          </Typography>
        </Box>
      </Box>

      {/* ── Filtro ── */}
      <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        {/* Cabecera — mismo patrón que FiltrosBar */}
        <Box sx={{ px: 3, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: `${theme.palette.primary.main}08`, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Icon icon="eva:funnel-fill" width={13} color={theme.palette.primary.main} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.09em', lineHeight: 1 }}>
            Filtros
          </Typography>
          {rfcFiltro && (
            <>
              <Chip
                label={`RFC: ${rfcFiltro}`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: `${theme.palette.primary.main}14`, color: 'primary.main', ml: 0.5, fontFamily: 'monospace', letterSpacing: 1 }}
              />
              <Chip
                label="Limpiar"
                size="small"
                variant="outlined"
                onClick={onLimpiar}
                onDelete={onLimpiar}
                deleteIcon={<Icon icon="eva:close-fill" width={12} />}
                sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer', borderColor: `${theme.palette.primary.main}50`, color: 'primary.main' }}
              />
            </>
          )}
          <Box flex={1} />
          <Tooltip title="Actualizar">
            <IconButton onClick={() => void refetch()} size="small">
              <Icon icon="eva:refresh-fill" width={18} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Controles */}
        <Box
          component="form"
          onSubmit={handleSubmit(onBuscar)}
          sx={{ px: 3, py: 1.75, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: `${theme.palette.primary.main}03` }}
        >
          <TextField
            label="Buscar por RFC" size="small" {...register('rfc')} placeholder="Ej: ABC123456XY1"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="eva:search-fill" width={16} color={theme.palette.primary.main} />
                </InputAdornment>
              ),
              style: { fontFamily: 'monospace', letterSpacing: 1 },
            }}
            sx={{ minWidth: 260 }}
          />
          <Button type="submit" variant="contained" size="medium" disabled={isLoading}
            startIcon={<Icon icon="eva:search-fill" width={16} />}>
            Buscar
          </Button>
        </Box>
      </Paper>

      {/* ── Tabla ── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: `${theme.palette.primary.main}06`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon="eva:list-fill" width={16} color={theme.palette.primary.main} />
            <Typography variant="subtitle2" fontWeight={600} color="primary.main">Resultados</Typography>
          </Box>
          {!isLoading && (
            <Chip
              label={`${data.length} consulta${data.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: `${theme.palette.primary.main}14`, color: 'primary.dark', fontWeight: 700 }}
            />
          )}
        </Box>

        {isError && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 1.5 }} icon={<Icon icon="eva:alert-circle-fill" width={20} />}>
            No se pudo cargar el historial. Verifica que el servidor esté en línea.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />)}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'rgba(0,0,0,0.02)', fontSize: '0.8rem' } }}>
                  <TableCell>#</TableCell>
                  <TableCell>RFC</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: `${theme.palette.primary.main}0a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon icon="eva:inbox-fill" width={28} color={theme.palette.primary.main} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {rfcFiltro ? `Sin consultas para el RFC ${rfcFiltro}` : 'Aún no hay consultas registradas'}
                        </Typography>
                        {rfcFiltro && (
                          <Button size="small" variant="text" onClick={onLimpiar}>Ver todas las consultas</Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => <FilaHistorial key={row.id} row={row} onVer={setDetalleId} />)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} color="primary" />
          </Box>
        )}
      </Paper>

      {/* ── Dialog de detalle ── */}
      {detalleId !== null && <DetalleDialog id={detalleId} onClose={() => setDetalleId(null)} />}
    </Box>
  );
}
