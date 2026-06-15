import { useState, useMemo, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import type {
  ApiResponseModel,
  DatosGenerales,
  CreditoFinanciero,
  CreditoComercial,
  Historia,
  Score,
  Califica,
  HawkAlert,
  Declarativa,
  Accionista,
  HistorialConsultasModel,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Backend puede devolver objetos en campos tipados como string; este helper los convierte a string seguro
function safeStr(val: unknown, fallback = '—'): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val || fallback;
  return fallback;
}

function Campo({ label, valor }: { label: string; valor?: string | undefined }) {
  if (!valor || typeof valor !== 'string') return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} color="text.primary">{valor}</Typography>
    </Box>
  );
}

function SeccionTitulo({ icon, titulo, count, color }: {
  icon: string; titulo: string; count?: number; color?: string;
}) {
  const theme = useTheme();
  const c = color ?? theme.palette.primary.main;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon icon={icon} width={17} color={c} />
      </Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">{titulo}</Typography>
      {count !== undefined && (
        <Chip label={count} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, bgcolor: count > 0 ? `${c}18` : 'action.hover', color: count > 0 ? c : 'text.secondary' }} />
      )}
    </Box>
  );
}

// ─── Barra de filtros compartida ──────────────────────────────────────────────

function FiltrosBar({ children, color, hasActive, count, total, onClear }: {
  children: ReactNode;
  color: string;
  hasActive: boolean;
  count: number;
  total: number;
  onClear: () => void;
}) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Cabecera de filtros */}
      <Box sx={{ px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: `${color}08`, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Icon icon="eva:funnel-fill" width={13} color={color} />
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.09em', lineHeight: 1 }}>
          Filtros
        </Typography>
        {hasActive && (
          <>
            <Chip
              label={`${count} de ${total}`}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: `${color}14`, color, ml: 0.5 }}
            />
            <Chip
              label="Limpiar"
              size="small"
              variant="outlined"
              onClick={onClear}
              onDelete={onClear}
              deleteIcon={<Icon icon="eva:close-fill" width={12} />}
              sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer', borderColor: `${color}50`, color }}
            />
          </>
        )}
      </Box>
      {/* Controles */}
      <Box sx={{ px: 2.5, py: 1.75, bgcolor: `${color}03` }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Empty state de tabla ─────────────────────────────────────────────────────

function TablaVacia({ cols, mensaje }: { cols: number; mensaje: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} align="center" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Icon icon="eva:inbox-fill" width={32} color="#98989A" />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{mensaje}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

// ─── Score ────────────────────────────────────────────────────────────────────

function getScoreColor(valor?: string): string {
  const v = Number(valor);
  if (isNaN(v) || !valor) return '#4A4D50';
  if (v >= 700) return '#1E5B4F';
  if (v >= 500) return '#A57F2C';
  return '#dc3545';
}

function ScoreSection({ scores }: { scores: Score[] }) {
  const theme = useTheme();
  if (!scores.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2, borderColor: `${theme.palette.primary.main}20` }}>
      <SeccionTitulo icon="eva:star-fill" titulo="Score" count={scores.length} />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {scores.map((s, i) => {
          const scoreColor = getScoreColor(s.valorScore);
          return (
            <Box key={i} sx={{ p: 2.5, minWidth: 180, borderRadius: 2, border: '1px solid', borderColor: `${scoreColor}30`, bgcolor: `${scoreColor}08`, textAlign: 'center' }}>
              {typeof s.codigoScore === 'string' && s.codigoScore && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Código: {s.codigoScore}</Typography>
              )}
              <Typography sx={{ fontSize: '2.8rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                {safeStr(s.valorScore)}
              </Typography>
              {typeof s.errorScore === 'string' && s.errorScore && (
                <Chip label={`Error: ${s.errorScore}`} size="small" color="warning" variant="outlined" sx={{ mt: 1 }} />
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
                {[s.codigoRazon1, s.codigoRazon2, s.codigoRazon3, s.codigoRazon4]
                  .filter((r): r is string => typeof r === 'string' && !!r)
                  .map((r, ri) => (
                    <Chip key={ri} label={`R${ri + 1}: ${r}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                  ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ─── Datos Generales ──────────────────────────────────────────────────────────

function DatosGeneralesSection({ datos }: { datos: DatosGenerales }) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
      <SeccionTitulo icon="eva:person-fill" titulo="Datos Generales" />
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mb={1.5}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Identidad</Typography>
          <Campo label="RFC" valor={datos.rfcCliente} />
          <Campo label="Nombre / Razón Social" valor={datos.nombre} />
          <Campo label="Tipo Cliente" valor={datos.tipoCliente} />
          <Campo label="Calificación Cartera" valor={datos.calificacionCartera} />
          <Campo label="Actividad Económica 1" valor={datos.actividadEconomica1} />
          <Campo label="Actividad Económica 2" valor={datos.actividadEconomica2} />
          <Campo label="Actividad Económica 3" valor={datos.actividadEconomica3} />
          <Campo label="Nacionalidad" valor={datos.nacionalidad} />
          {datos.clavePrevencion && (
            <Box sx={{ mt: 1 }}>
              <Chip label={`Clave Prevención: ${datos.clavePrevencion}`} size="small" color="warning" variant="outlined" />
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mb={1.5}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Domicilio</Typography>
          <Campo label="Dirección" valor={datos.direccion1} />
          <Campo label="Colonia" valor={datos.coloniaPoblacion} />
          <Campo label="Delegación / Municipio" valor={datos.delegacionMunicipio} />
          <Campo label="Ciudad" valor={datos.ciudad} />
          <Campo label="Estado" valor={datos.estado} />
          <Campo label="CP" valor={datos.codigoPostal} />
          <Campo label="País" valor={datos.pais} />
          <Campo label="Teléfono" valor={datos.telefono} />
          <Campo label="Extensión" valor={datos.extension} />
          <Campo label="Fax" valor={datos.fax} />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mb={1.5}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Consultas Recientes</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>Entidad Financiera</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {[
                { label: 'Últ. 3m',  val: datos.consultaEntidadFinancieraUltimos3Meses },
                { label: 'Últ. 12m', val: datos.consultaEntidadFinancieraUltimos12Meses },
                { label: 'Últ. 24m', val: datos.consultaEntidadFinancieraUltimos24Meses },
                { label: '+24m',     val: datos.consultaEntidadFinancieraMas24Meses },
              ].map(({ label, val }) => {
                const display = safeStr(val, '0');
                const positive = typeof val === 'string' && Number(val) > 0;
                return (
                  <Box key={label} sx={{ p: 1, textAlign: 'center', borderRadius: 1, bgcolor: positive ? `${primaryColor}0a` : 'action.hover', border: '1px solid', borderColor: positive ? `${primaryColor}30` : 'divider' }}>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: positive ? 'primary.main' : 'text.disabled' }}>
                      {display}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>Empresa Comercial</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {[
                { label: 'Últ. 3m',  val: datos.consultaEmpresaComercialUltimos3Meses },
                { label: 'Últ. 12m', val: datos.consultaEmpresaComercialUltimos12Meses },
                { label: 'Últ. 24m', val: datos.consultaEmpresaComercialUltimos24Meses },
                { label: '+24m',     val: datos.consultaEmpresaComercialMas24Meses },
              ].map(({ label, val }) => {
                const display = safeStr(val, '0');
                const positive = typeof val === 'string' && Number(val) > 0;
                return (
                  <Box key={label} sx={{ p: 1, textAlign: 'center', borderRadius: 1, bgcolor: positive ? 'rgba(30,91,79,0.06)' : 'action.hover', border: '1px solid', borderColor: positive ? 'rgba(30,91,79,0.2)' : 'divider' }}>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: positive ? 'secondary.main' : 'text.disabled' }}>
                      {display}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

// ─── Hawk Alertas ─────────────────────────────────────────────────────────────

const HAWK_COLOR = '#b45309';

function HawkSection({ hc, hr }: { hc: HawkAlert[]; hr: HawkAlert[] }) {
  const hasHc = hc.length > 0;
  const hasHr = hr.length > 0;
  if (!hasHc && !hasHr) return null;

  const alerta = (h: HawkAlert, usuario: string) => (
    <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: `${HAWK_COLOR}25`, bgcolor: `${HAWK_COLOR}06`, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Box sx={{ minWidth: 90 }}>
        <Typography variant="caption" color="text.secondary" display="block">Código</Typography>
        <Typography variant="body2" fontWeight={700} color="warning.dark">{safeStr(h.codigoHawk)}</Typography>
      </Box>
      <Box sx={{ minWidth: 110 }}>
        <Typography variant="caption" color="text.secondary" display="block">Fecha</Typography>
        <Typography variant="body2" fontWeight={500}>{safeStr(h.fechaMensajeHawk)}</Typography>
      </Box>
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="caption" color="text.secondary" display="block">Usuario</Typography>
        <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>{usuario}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography variant="caption" color="text.secondary" display="block">Descripción</Typography>
        <Typography variant="body2">{safeStr(h.descripcionPrevencionHawk)}</Typography>
      </Box>
    </Box>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2, borderColor: `${HAWK_COLOR}25` }}>
      <SeccionTitulo icon="eva:alert-triangle-fill" titulo="Alertas Hawk" count={hc.length + hr.length} color={HAWK_COLOR} />
      <Divider sx={{ my: 2 }} />

      {hasHc && (
        <Box sx={{ mb: hasHr ? 2.5 : 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>
            Hawk HC — Consultas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {hc.map((h, i) => <Box key={i}>{alerta(h, safeStr(h.usuarioReporta))}</Box>)}
          </Box>
        </Box>
      )}

      {hasHr && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>
            Hawk HR — Reportes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {hr.map((h, i) => <Box key={i}>{alerta(h, safeStr(h.tipoUsuarioReporta))}</Box>)}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

// ─── Declarativa ──────────────────────────────────────────────────────────────

function DeclarativaSection({ declarativa }: { declarativa: Declarativa }) {
  const textos = [
    declarativa.declarativa1,  declarativa.declarativa2,  declarativa.declarativa3,
    declarativa.declarativa4,  declarativa.declarativa5,  declarativa.declarativa6,
    declarativa.declarativa7,  declarativa.declarativa8,  declarativa.declarativa9,
    declarativa.declarativa10, declarativa.declarativa11, declarativa.declarativa12,
    declarativa.declarativa13, declarativa.declarativa14, declarativa.declarativa15,
    declarativa.declarativa16, declarativa.declarativa17, declarativa.declarativa18,
    declarativa.declarativa19, declarativa.declarativa20, declarativa.declarativa21,
  ].filter(Boolean);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
      <SeccionTitulo icon="eva:file-text-outline" titulo="Declarativa del Cliente" color="#1E5B4F" />
      <Divider sx={{ my: 2 }} />
      {textos.length > 0 && (
        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'rgba(30,91,79,0.04)', border: '1px solid', borderColor: 'rgba(30,91,79,0.15)', mb: 2 }}>
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8 }}>
            {textos.join(' ')}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Campo label="RFC" valor={declarativa.rfc} />
        <Campo label="Fecha Declarativa" valor={declarativa.fechaDeclarativa} />
        <Campo label="Tipo Declarativa" valor={declarativa.tipoDeclarativa} />
        <Campo label="Tipo Otorgante" valor={declarativa.tipoOtorgante} />
        <Campo label="Número de Contrato" valor={declarativa.numeroContrato} />
        <Campo label="Tipo Crédito" valor={declarativa.tipoCredito} />
      </Box>
    </Paper>
  );
}

// ─── Accionistas ──────────────────────────────────────────────────────────────

function AccionistasSection({ accionistas }: { accionistas: Accionista[] }) {
  const theme = useTheme();
  const color = theme.palette.primary.main;
  const [busqueda, setBusqueda] = useState('');

  const visibles = useMemo(() => {
    if (!busqueda.trim()) return accionistas;
    const q = busqueda.trim().toUpperCase();
    return accionistas.filter((a) => {
      const nombre = [a.nombreAccionista, a.apellidoPaterno, a.apellidoMaterno].filter(Boolean).join(' ').toUpperCase();
      return nombre.includes(q) || (a.rfc ?? '').toUpperCase().includes(q);
    });
  }, [accionistas, busqueda]);

  const hayFiltros = busqueda.trim() !== '';

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden' }}>
      <Accordion defaultExpanded={accionistas.length <= 4} disableGutters elevation={0}>
        <AccordionSummary expandIcon={<Icon icon="eva:chevron-down-fill" color={color} />}
          sx={{ px: 2.5, py: 1.5, '&.Mui-expanded': { minHeight: 0 } }}>
          <SeccionTitulo icon="eva:people-fill" titulo="Accionistas" count={accionistas.length} />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Divider />
          <FiltrosBar color={color} hasActive={hayFiltros} count={visibles.length} total={accionistas.length} onClear={() => setBusqueda('')}>
            <TextField
              size="small"
              placeholder="Buscar por nombre o RFC…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="eva:search-fill" width={16} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 280 }}
            />
          </FiltrosBar>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {visibles.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Icon icon="eva:inbox-fill" width={32} color="#98989A" />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Sin resultados para "{busqueda}"
                </Typography>
              </Box>
            ) : visibles.map((a, i) => (
              <Box key={i} sx={{ px: 3, py: 2, borderBottom: i < visibles.length - 1 ? '1px solid' : 'none', borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block"
                    sx={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', mb: 0.5 }}>
                    Nombre
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {[a.nombreAccionista, a.segundoNombre, a.apellidoPaterno, a.apellidoMaterno].filter(Boolean).join(' ') || '—'}
                  </Typography>
                  {a.tipoPersona && <Chip label={`Tipo ${a.tipoPersona}`} size="small" sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} />}
                </Box>
                <Box>
                  <Campo label="RFC" valor={a.rfc} />
                  <Campo label="CURP" valor={a.curp} />
                </Box>
                <Box>
                  <Campo label="Dirección" valor={a.direccion1} />
                  <Campo label="Dirección 2" valor={a.direccion2} />
                  <Campo label="Colonia" valor={a.coloniaPoblacion} />
                </Box>
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

// ─── Historia de Crédito ──────────────────────────────────────────────────────

function HistoriaSection({ historia }: { historia: Historia[] }) {
  const theme = useTheme();
  const color = theme.palette.primary.main;
  const [soloConVencido, setSoloConVencido] = useState(false);
  const [periodoDesde, setPeriodoDesde] = useState('');
  const [periodoHasta, setPeriodoHasta] = useState('');

  const visibles = useMemo(() => historia.filter((h) => {
    if (soloConVencido && !(Number(h.saldoVencidoA90Dias) > 0)) return false;
    if (periodoDesde && (h.periodo ?? '') < periodoDesde) return false;
    if (periodoHasta && (h.periodo ?? '') > periodoHasta) return false;
    return true;
  }), [historia, soloConVencido, periodoDesde, periodoHasta]);

  const hayFiltros = soloConVencido || !!periodoDesde || !!periodoHasta;

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden' }}>
      <Accordion defaultExpanded={historia.length <= 6} disableGutters elevation={0}>
        <AccordionSummary expandIcon={<Icon icon="eva:chevron-down-fill" color={color} />}
          sx={{ px: 2.5, py: 1.5, '&.Mui-expanded': { minHeight: 0 } }}>
          <SeccionTitulo icon="eva:trending-up-fill" titulo="Historia de Crédito" count={historia.length} />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Divider />
          <FiltrosBar color={color} hasActive={hayFiltros} count={visibles.length} total={historia.length}
            onClear={() => { setSoloConVencido(false); setPeriodoDesde(''); setPeriodoHasta(''); }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <TextField size="small" label="Periodo desde" placeholder="AAAAMM" value={periodoDesde}
                onChange={(e) => setPeriodoDesde(e.target.value)} sx={{ width: 150 }}
                inputProps={{ style: { fontFamily: 'monospace' } }} />
              <TextField size="small" label="Periodo hasta" placeholder="AAAAMM" value={periodoHasta}
                onChange={(e) => setPeriodoHasta(e.target.value)} sx={{ width: 150 }}
                inputProps={{ style: { fontFamily: 'monospace' } }} />
              <Chip
                label="Solo con vencido +90d"
                onClick={() => setSoloConVencido((v) => !v)}
                color={soloConVencido ? 'error' : 'default'}
                variant={soloConVencido ? 'filled' : 'outlined'}
                size="small"
                icon={<Icon icon="eva:alert-triangle-fill" width={14} />}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            </Stack>
          </FiltrosBar>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${color}06` }}>
                  {['Periodo', 'Saldo Vigente', 'Vcdo 1-29d', 'Vcdo 30-59d', 'Vcdo 60-89d', 'Vcdo +90d', 'Calif. Cartera', 'Máx. Vencido', 'Días Vencido'].map((h) => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.length === 0
                  ? <TablaVacia cols={9} mensaje="Sin registros con los filtros aplicados" />
                  : visibles.map((h, i) => {
                    const tieneVencido = Number(h.saldoVencidoA90Dias) > 0;
                    return (
                      <TableRow key={i} hover sx={{ bgcolor: tieneVencido ? 'rgba(220,53,69,0.04)' : 'inherit' }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{safeStr(h.periodo)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.saldoVigente)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.saldoVencido1A29Dias)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.saldoVencido30A59Dias)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.saldoVencido60A89Dias)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: tieneVencido ? 700 : 400, color: tieneVencido ? 'error.main' : 'inherit' }}>
                          {safeStr(h.saldoVencidoA90Dias)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(h.calificacioncartera)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.maximoSaldoVencido)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(h.mayorNumeroDiasVencido)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

// ─── Crédito Financiero ───────────────────────────────────────────────────────

function CreditoFinancieroSection({ items }: { items: CreditoFinanciero[] }) {
  const theme = useTheme();
  const color = theme.palette.primary.main;
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMoneda, setFiltroMoneda] = useState('');
  const [soloConAtraso, setSoloConAtraso] = useState(false);

  const tiposUnicos   = useMemo(() => [...new Set(items.map((c) => c.tipoCredito).filter(Boolean) as string[])], [items]);
  const monedasUnicas = useMemo(() => [...new Set(items.map((c) => c.moneda).filter(Boolean) as string[])], [items]);

  const visibles = useMemo(() => items.filter((c) => {
    if (filtroTipo   && c.tipoCredito !== filtroTipo)   return false;
    if (filtroMoneda && c.moneda      !== filtroMoneda) return false;
    if (soloConAtraso && !(Number(c.atrasoMayor) > 0))  return false;
    return true;
  }), [items, filtroTipo, filtroMoneda, soloConAtraso]);

  const hayFiltros = !!filtroTipo || !!filtroMoneda || soloConAtraso;

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden' }}>
      <Accordion defaultExpanded={items.length <= 5} disableGutters elevation={0}>
        <AccordionSummary expandIcon={<Icon icon="eva:chevron-down-fill" color={color} />}
          sx={{ px: 2.5, py: 1.5, '&.Mui-expanded': { minHeight: 0 } }}>
          <SeccionTitulo icon="eva:credit-card-fill" titulo="Crédito Financiero" count={items.length} />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Divider />
          <FiltrosBar color={color} hasActive={hayFiltros} count={visibles.length} total={items.length}
            onClear={() => { setFiltroTipo(''); setFiltroMoneda(''); setSoloConAtraso(false); }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {tiposUnicos.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Tipo crédito</InputLabel>
                  <Select label="Tipo crédito" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {tiposUnicos.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              {monedasUnicas.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Moneda</InputLabel>
                  <Select label="Moneda" value={filtroMoneda} onChange={(e) => setFiltroMoneda(e.target.value)}>
                    <MenuItem value=""><em>Todas</em></MenuItem>
                    {monedasUnicas.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              <Chip
                label="Con atraso"
                onClick={() => setSoloConAtraso((v) => !v)}
                color={soloConAtraso ? 'error' : 'default'}
                variant={soloConAtraso ? 'filled' : 'outlined'}
                size="small"
                icon={<Icon icon="eva:alert-circle-fill" width={14} />}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            </Stack>
          </FiltrosBar>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${color}06` }}>
                  {['Cuenta', 'Tipo', 'Moneda', 'Saldo Vigente', 'Saldo Vencido', 'Histórico', 'Atraso', 'Últ. Periodo', 'Apertura'].map((h) => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.length === 0
                  ? <TablaVacia cols={9} mensaje="Sin registros con los filtros aplicados" />
                  : visibles.map((c, i) => {
                    const tieneVencido = Number(c.saldoVencidoDe90a119Dias) > 0 || Number(c.saldoVencidoDe120a179Dias) > 0 || Number(c.saldoVencidoDe180DiasOMas) > 0;
                    return (
                      <TableRow key={i} hover sx={{ bgcolor: tieneVencido ? 'rgba(220,53,69,0.04)' : 'inherit' }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{safeStr(c.numeroCuenta)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(c.tipoCredito)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(c.moneda)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{safeStr(c.saldoVigente)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: tieneVencido ? 700 : 400, color: tieneVencido ? 'error.main' : 'inherit' }}>
                          {safeStr(c.saldoVencidoDe180DiasOMas)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{safeStr(c.historicoPagos)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(c.atrasoMayor)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{safeStr(c.ultimoPeriodoActualizado)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{safeStr(c.apertura)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

// ─── Crédito Comercial ────────────────────────────────────────────────────────

const COM_COLOR = '#1E5B4F';

function CreditoComercialSection({ items }: { items: CreditoComercial[] }) {
  const [soloVencidos, setSoloVencidos]     = useState(false);
  const [soloImpugnados, setSoloImpugnados] = useState(false);

  const base = items.filter((c) => c.saldoTotal || c.saldoVigente || c.identificadoUsuario || c.identificadorUsuario);

  const visibles = useMemo(() => base.filter((c) => {
    if (soloVencidos   && !(Number(c.saldoVencido) > 0))          return false;
    if (soloImpugnados && !(c.regInpugnado ?? c.regImpugnado))    return false;
    return true;
  }), [base, soloVencidos, soloImpugnados]);

  if (!base.length) return null;

  const hayFiltros = soloVencidos || soloImpugnados;

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden' }}>
      <Accordion defaultExpanded={base.length <= 5} disableGutters elevation={0}>
        <AccordionSummary expandIcon={<Icon icon="eva:chevron-down-fill" color={COM_COLOR} />}
          sx={{ px: 2.5, py: 1.5, '&.Mui-expanded': { minHeight: 0 } }}>
          <SeccionTitulo icon="eva:briefcase-fill" titulo="Crédito Comercial" count={base.length} color={COM_COLOR} />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Divider />
          <FiltrosBar color={COM_COLOR} hasActive={hayFiltros} count={visibles.length} total={base.length}
            onClear={() => { setSoloVencidos(false); setSoloImpugnados(false); }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                label="Con saldo vencido"
                onClick={() => setSoloVencidos((v) => !v)}
                color={soloVencidos ? 'error' : 'default'}
                variant={soloVencidos ? 'filled' : 'outlined'}
                size="small"
                icon={<Icon icon="eva:alert-triangle-fill" width={14} />}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
              <Chip
                label="Impugnados"
                onClick={() => setSoloImpugnados((v) => !v)}
                color={soloImpugnados ? 'warning' : 'default'}
                variant={soloImpugnados ? 'filled' : 'outlined'}
                size="small"
                icon={<Icon icon="eva:flag-fill" width={14} />}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            </Stack>
          </FiltrosBar>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${COM_COLOR}06` }}>
                  {['Usuario', 'Saldo Total', 'Saldo Vigente', 'Saldo Vencido', 'Saldo Prom.', 'Histórico', 'Últ. Periodo', 'Impugnado'].map((h) => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.length === 0
                  ? <TablaVacia cols={8} mensaje="Sin registros con los filtros aplicados" />
                  : visibles.map((c, i) => {
                    const tieneVencido = Number(c.saldoVencido) > 0;
                    return (
                      <TableRow key={i} hover sx={{ bgcolor: tieneVencido ? 'rgba(220,53,69,0.04)' : 'inherit' }}>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(c.identificadoUsuario ?? c.identificadorUsuario)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{safeStr(c.saldoTotal)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(c.saldoVigente)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: tieneVencido ? 700 : 400, color: tieneVencido ? 'error.main' : 'inherit' }}>
                          {safeStr(c.saldoVencido)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{safeStr(c.saldoPromedio)}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.85rem' }}>{safeStr(c.historicoPagos)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(c.ultimoPeriodoActualizado)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{safeStr(c.regInpugnado ?? c.regImpugnado)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

// ─── Calificador / Califica ───────────────────────────────────────────────────

function CalificadorSection({ items }: { items: Califica[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
      <SeccionTitulo icon="eva:checkmark-circle-2-fill" titulo="Calificador" count={items.length} color="#A57F2C" />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
        {items.map((c, i) => (
          <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="caption" color="text.secondary" display="block"
              sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {safeStr(c.clave, '')} — {safeStr(c.nombre, '')}
            </Typography>
            <Typography variant="body2" fontWeight={700} color="text.primary" mt={0.25}>
              {safeStr(c.valorCaracteristica)}
            </Typography>
            {typeof c.codigoError === 'string' && c.codigoError && (
              <Chip label={`Error: ${c.codigoError}`} size="small" color="warning" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: '0.68rem' }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Historial de Consultas ───────────────────────────────────────────────────

function HistorialConsultasSection({ hc }: { hc: HistorialConsultasModel }) {
  const theme = useTheme();
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
      <SeccionTitulo icon="eva:clock-fill" titulo="Historial de Consultas" color={theme.palette.primary.main} />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Campo label="RFC" valor={hc.rfc} />
        <Campo label="Fecha de Consulta" valor={hc.fechaConsulta} />
        <Campo label="Tipo de Usuario" valor={hc.tipoUsuario} />
      </Box>
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ResultadoBuroProps {
  data: ApiResponseModel;
}

export function ResultadoBuro({ data }: ResultadoBuroProps) {
  const calificadorItems = data.calificador ?? data.califica ?? [];
  const hasCredFin  = (data.creditoFinanciero?.length ?? 0) > 0;
  const hasCredCom  = (data.creditoComercial?.length ?? 0) > 0;
  const hasScore    = (data.score?.length ?? 0) > 0;
  const hasCalif    = calificadorItems.length > 0;
  const hasHawk     = (data.hawkHc?.length ?? 0) > 0 || (data.hawkHr?.length ?? 0) > 0;
  const hasDecl     = !!data.declarativa;
  const hasAccion   = (data.accionista?.length ?? 0) > 0;
  const hasHistoria = (data.historia?.length ?? 0) > 0;
  const hasHistCons = !!data.historialConsultas;
  const hasAnything = hasScore || data.datosGenerales || hasCredFin || hasCredCom || hasCalif || hasHawk || hasDecl || hasAccion || hasHistoria;

  return (
    <Box>
      {data.encabezado && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<Icon icon="eva:checkmark-circle-fill" width={16} />}
            label={`Retorno: ${data.encabezado.claveRetorno ?? '—'}`}
            size="small"
            color={data.encabezado.claveRetorno === '0000' ? 'success' : 'warning'}
            variant="outlined"
          />
          {data.encabezado.fechaConsulta && (
            <Chip icon={<Icon icon="eva:calendar-fill" width={16} />} label={`Fecha: ${data.encabezado.fechaConsulta}`} size="small" variant="outlined" />
          )}
          {data.encabezado.identificadorTransaccion && (
            <Chip icon={<Icon icon="eva:hash-fill" width={16} />} label={`Tx: ${data.encabezado.identificadorTransaccion}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
          )}
        </Box>
      )}

      {data.encabezado?.claveRetorno && data.encabezado.claveRetorno !== '0000' && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }} icon={<Icon icon="eva:alert-triangle-fill" width={20} />}>
          Clave de retorno <strong>{safeStr(data.encabezado.claveRetorno)}</strong> — la respuesta puede ser parcial o de prueba.
        </Alert>
      )}

      {hasScore    && <ScoreSection scores={data.score!} />}
      {data.datosGenerales && <DatosGeneralesSection datos={data.datosGenerales} />}
      {hasHawk     && <HawkSection hc={data.hawkHc ?? []} hr={data.hawkHr ?? []} />}
      {hasDecl     && <DeclarativaSection declarativa={data.declarativa!} />}
      {hasAccion   && <AccionistasSection accionistas={data.accionista!} />}
      {hasCredFin  && <CreditoFinancieroSection items={data.creditoFinanciero!} />}
      {hasHistoria && <HistoriaSection historia={data.historia!} />}
      {hasCredCom  && <CreditoComercialSection items={data.creditoComercial!} />}
      {hasCalif    && <CalificadorSection items={calificadorItems} />}
      {hasHistCons && <HistorialConsultasSection hc={data.historialConsultas!} />}

      {!hasAnything && (
        <Box sx={{ py: 5, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
          <Icon icon="eva:alert-triangle-fill" width={40} color="#A57F2C" />
          <Typography variant="body1" mt={1.5} color="text.secondary">La respuesta no contiene datos reconocidos</Typography>
          <Typography variant="caption" color="text.disabled">Revisa el JSON completo más abajo</Typography>
        </Box>
      )}
    </Box>
  );
}
