import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import {
  useEjecutarPreanalisis,
  useFacts,
  classifyPreanalisisError,
  type PreanalisisResponse,
} from '../api/preanalysisApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeStr(val: unknown, fallback = '—'): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val || fallback;
  return fallback;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

const RIESGO_COLORS: Record<string, string> = {
  CRITICO: '#dc3545',
  ALTO:    '#dc3545',
  MEDIO:   '#A57F2C',
  BAJO:    '#1E5B4F',
};

const DECISION_COLORS: Record<string, string> = {
  RECHAZAR:    '#dc3545',
  REVISAR:     '#A57F2C',
  PREAPROBADO: '#1E5B4F',
};

const DECISION_ICONS: Record<string, string> = {
  RECHAZAR:    'eva:close-circle-fill',
  REVISAR:     'eva:alert-triangle-fill',
  PREAPROBADO: 'eva:checkmark-circle-fill',
};

function getDecisionColor(d: string) {
  return DECISION_COLORS[d.toUpperCase()] ?? '#4A4D50';
}

function getRiesgoColor(r: string) {
  return RIESGO_COLORS[r.toUpperCase()] ?? '#4A4D50';
}

function getDecisionIcon(d: string) {
  return DECISION_ICONS[d.toUpperCase()] ?? 'eva:question-mark-circle-fill';
}

// ─── Facts accordion ──────────────────────────────────────────────────────────

function FactsPanel({ consultaId }: { consultaId: number }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, isError } = useFacts(enabled ? consultaId : null);

  const handleExpand = (_: React.SyntheticEvent, expanded: boolean) => {
    if (expanded) setEnabled(true);
  };

  return (
    <Accordion
      onChange={handleExpand}
      elevation={0}
      sx={{
        mt: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { mt: 2.5 },
      }}
    >
      <AccordionSummary
        expandIcon={<Icon icon="eva:chevron-down-fill" width={18} color="#98989A" />}
        sx={{
          px: 2,
          py: 1,
          minHeight: '44px !important',
          '& .MuiAccordionSummary-content': { my: '0 !important' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="eva:code-fill" width={16} color="#98989A" />
          <Typography variant="body2" fontWeight={600} color="text.secondary" fontSize="0.85rem">
            Facts extraídos (debug)
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          )}
          {isError && (
            <Alert
              severity="warning"
              icon={<Icon icon="eva:alert-triangle-fill" width={18} />}
              sx={{ borderRadius: 1.5 }}
            >
              No se pudieron cargar los facts del motor de decisiones.
            </Alert>
          )}
          {data && (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 1.5,
                overflow: 'auto',
                background: '#1e1e2e',
                color: '#89b4fa',
                fontSize: '0.75rem',
                maxHeight: 400,
                lineHeight: 1.6,
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function PreanalisisResult({
  data,
  consultaId,
  primaryColor,
}: {
  data: PreanalisisResponse;
  consultaId: number;
  primaryColor: string;
}) {
  const decisionStr   = typeof data.decision === 'string' ? data.decision : '';
  const riesgoStr     = typeof data.nivelRiesgo === 'string' ? data.nivelRiesgo : '';
  const decisionColor = decisionStr ? getDecisionColor(decisionStr) : '#4A4D50';
  const riesgoColor   = riesgoStr ? getRiesgoColor(riesgoStr) : '#4A4D50';

  return (
    <Box>
      {data.partialFacts && (
        <Alert
          severity="warning"
          icon={<Icon icon="eva:alert-triangle-fill" width={20} />}
          sx={{ mb: 2.5, borderRadius: 1.5 }}
        >
          Respuesta parcial — algunos facts no pudieron extraerse correctamente.
        </Alert>
      )}

      {/* Decisión / Riesgo / Score */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        {decisionStr && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: `${decisionColor}35`,
              bgcolor: `${decisionColor}0d`,
              textAlign: 'center',
              minWidth: 148,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.75}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}
            >
              Decisión
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
              <Icon icon={getDecisionIcon(decisionStr)} color={decisionColor} width={20} />
              <Typography variant="h6" fontWeight={800} color={decisionColor} lineHeight={1}>
                {decisionStr}
              </Typography>
            </Box>
          </Box>
        )}

        {riesgoStr && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: `${riesgoColor}35`,
              bgcolor: `${riesgoColor}0d`,
              textAlign: 'center',
              minWidth: 148,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.75}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}
            >
              Nivel de Riesgo
            </Typography>
            <Typography variant="h6" fontWeight={800} color={riesgoColor} lineHeight={1}>
              {riesgoStr}
            </Typography>
          </Box>
        )}

        {data.score !== undefined && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: `${primaryColor}06`,
              textAlign: 'center',
              minWidth: 110,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.75}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}
            >
              Score
            </Typography>
            <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1}>
              {data.score}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Alertas */}
      {data.alertas && data.alertas.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            display="block"
            mb={1}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Alertas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {data.alertas.map((alerta, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(220,53,69,0.06)',
                  border: '1px solid rgba(220,53,69,0.2)',
                }}
              >
                <Icon
                  icon="eva:alert-circle-fill"
                  color="#dc3545"
                  width={16}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.primary">
                  {safeStr(alerta)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Motivos */}
      {data.reasons && data.reasons.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            display="block"
            mb={1}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Motivos
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {data.reasons.map((reason, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: `${primaryColor}06`,
                  border: '1px solid',
                  borderColor: `${primaryColor}20`,
                }}
              >
                <Icon
                  icon="eva:info-fill"
                  color={primaryColor}
                  width={16}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.primary">
                  {safeStr(reason)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Reglas disparadas */}
      {data.rulesFired && data.rulesFired.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            display="block"
            mb={1}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Reglas disparadas
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {data.rulesFired.map((rule, i) => (
              <Chip
                key={i}
                label={safeStr(rule)}
                size="small"
                icon={<Icon icon="eva:flash-fill" width={13} />}
                sx={{
                  height: 26,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: `${primaryColor}12`,
                  color: 'primary.dark',
                  '& .MuiChip-icon': { color: primaryColor },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <FactsPanel consultaId={consultaId} />
    </Box>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface BuroPreanalysisPanelProps {
  consultaId: number;
  autoRun?: boolean;
}

export function BuroPreanalysisPanel({ consultaId, autoRun = false }: BuroPreanalysisPanelProps) {
  const theme = useTheme();
  const { mutate, data, isPending, isError, error, isSuccess, reset } = useEjecutarPreanalisis();

  // Dispara automáticamente al montar o cuando cambia consultaId (si autoRun=true).
  // reset() limpia cualquier resultado previo antes de la nueva ejecución.
  useEffect(() => {
    if (!autoRun) return;
    reset();
    mutate(consultaId);
  }, [autoRun, consultaId, mutate, reset]);

  const handleAnalizar = () => {
    reset();
    mutate(consultaId);
  };

  return (
    <Paper
      variant="outlined"
      sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', borderColor: `${theme.palette.primary.main}25` }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: `${theme.palette.primary.main}08`,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            background: theme.brandGradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon="eva:settings-2-fill" color="#fff" width={17} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700} color="primary.dark">
          Preanálisis Drools
        </Typography>
        {isSuccess && (
          <Chip
            label="Completado"
            size="small"
            icon={<Icon icon="eva:checkmark-circle-fill" width={13} />}
            sx={{
              ml: 'auto',
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 600,
              bgcolor: 'rgba(30,91,79,0.1)',
              color: '#1E5B4F',
              '& .MuiChip-icon': { color: '#1E5B4F' },
            }}
          />
        )}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ p: 2.5 }}>
        {/* Botón acción */}
        <Button
          variant={isSuccess ? 'outlined' : 'contained'}
          size={isSuccess ? 'small' : 'medium'}
          onClick={handleAnalizar}
          disabled={isPending}
          startIcon={
            isPending
              ? <CircularProgress size={16} color="inherit" />
              : <Icon icon={isSuccess ? 'eva:refresh-fill' : 'eva:flash-fill'} width={isSuccess ? 16 : 18} />
          }
          sx={{ mb: isSuccess ? 2.5 : 0 }}
        >
          {isPending ? 'Analizando…' : isSuccess ? 'Re-analizar' : 'Analizar con Drools'}
        </Button>

        {/* Error */}
        {isError && (
          <Alert
            severity="error"
            icon={<Icon icon="eva:alert-circle-fill" width={20} />}
            sx={{ mt: 2, borderRadius: 1.5 }}
          >
            {classifyPreanalisisError(error)}
          </Alert>
        )}

        {/* Resultado */}
        {isSuccess && (
          <PreanalisisResult
            data={data}
            consultaId={consultaId}
            primaryColor={theme.palette.primary.main}
          />
        )}
      </Box>
    </Paper>
  );
}
