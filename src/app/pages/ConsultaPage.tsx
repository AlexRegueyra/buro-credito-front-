import { useState, useMemo, useEffect, Component, type ReactNode } from 'react';
import { format as fnsFormat, parseISO } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@mui/material/styles';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';

import {
  useConsultarReportePM,
  useConsultarInformeBuro,
  useConsultarPerfilador,
  useConsultarReportePFAE,
  useConsultarInformeBuroPFAE,
  useConsultarPerfiladorPFAE,
  useEstados,
  usePaises,
  fetchHistorial,
} from '@features/buro/api/buroApi';
import { pfaeAvailable, PFAE_MOCK_ENABLED } from '@features/buro/flags';
import { ResultadoBuro } from '@features/buro/components/ResultadoBuro';
import { BuroPreanalysisPanel } from '@features/buro/components/BuroPreanalysisPanel';
import type { ConsultaRequest, TipoConsulta } from '@features/buro/types';

// ─── Error boundary ──────────────────────────────────────────────────────────

class RenderErrorBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={700} mb={0.5}>
            Error al mostrar {this.props.label}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </Typography>
        </Alert>
      );
    }
    return this.props.children;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoReporte = 'reporte' | 'informe' | 'perfilador';

const TIPO_REPORTE_LABELS: Record<TipoReporte, { label: string; icon: string }> = {
  reporte:    { label: 'Reporte de Crédito', icon: 'eva:file-text-fill' },
  informe:    { label: 'Informe Buró',        icon: 'eva:bar-chart-fill' },
  perfilador: { label: 'Perfilador PM',       icon: 'eva:person-done-fill' },
};

// ─── Validación ───────────────────────────────────────────────────────────────

const TEXTO_BURO = /^[A-ZÁÉÍÓÚÜÑa-záéíóúüñ0-9 .&()/-]*$/;
const textoSeguro = (label: string) =>
  z
    .string()
    .regex(TEXTO_BURO, `${label} contiene caracteres no permitidos`)
    .optional()
    .or(z.literal(''));

const schema = z.object({
  tipoConsulta: z.enum(['PM', 'PFAE']),
  rfc: z
    .string()
    .min(1, 'RFC requerido')
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/, 'Formato inválido — ej: ABC123456XY1'),
  razonSocial: textoSeguro('Razón Social'),
  tipoCliente: z.string().optional(),
  nombre: textoSeguro('Nombre'),
  segundoNombre: textoSeguro('Segundo Nombre'),
  apellidoPaterno: textoSeguro('Apellido Paterno'),
  apellidoMaterno: textoSeguro('Apellido Materno'),
  apellidoAdicional: textoSeguro('Apellido Adicional'),
  curp: z
    .string()
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/, 'CURP inválida')
    .optional()
    .or(z.literal('')),
  fechaDeNacimiento: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Fecha inválida')
    .optional()
    .or(z.literal('')),
  nacionalidad: z
    .string()
    .max(4, 'Máximo 4 caracteres (ej: MX)')
    .regex(TEXTO_BURO, 'Nacionalidad contiene caracteres no permitidos')
    .optional()
    .or(z.literal('')),
  domDireccion: z
    .string()
    .min(1, 'La dirección es requerida')
    .regex(TEXTO_BURO, 'Contiene caracteres no permitidos'),
  domColonia: textoSeguro('Colonia'),
  domCiudad: textoSeguro('Ciudad'),
  domEstado: z.string().min(1, 'El estado es requerido'),
  domCP: z
    .string()
    .min(1, 'El C.P. es requerido')
    .regex(/^\d{5}$/, 'Debe ser 5 dígitos'),
  domPais: z.string().default('MX'),
  domMunicipio: textoSeguro('Municipio'),
  indicadorScore: z.string().optional(),
  codigoScore: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipoConsulta === 'PM' && !data.razonSocial) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La razón social es requerida para Persona Moral',
      path: ['razonSocial'],
    });
  }
  // RFC length must match tipoConsulta — bloquea mezcla PM/PFAE
  if (data.rfc.length > 0) {
    if (data.tipoConsulta === 'PM' && data.rfc.length !== 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `RFC de Persona Moral debe tener 12 caracteres (tiene ${String(data.rfc.length)})`,
        path: ['rfc'],
      });
    }
    if (data.tipoConsulta === 'PFAE' && data.rfc.length !== 13) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `RFC de PFAE debe tener 13 caracteres (tiene ${String(data.rfc.length)})`,
        path: ['rfc'],
      });
    }
  }
  // PFAE — campos de persona física requeridos
  if (data.tipoConsulta === 'PFAE') {
    if (!data.nombre) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nombre requerido para PFAE', path: ['nombre'] });
    }
    if (!data.apellidoPaterno) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Apellido Paterno requerido para PFAE', path: ['apellidoPaterno'] });
    }
    if (!data.apellidoMaterno) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Apellido Materno requerido para PFAE', path: ['apellidoMaterno'] });
    }
  }
});

type FormValues = z.infer<typeof schema>;

// ─── Build request ────────────────────────────────────────────────────────────

function buildRequest(values: FormValues): ConsultaRequest {
  const isPM = values.tipoConsulta === 'PM';
  const base = { rfc: values.rfc.toUpperCase() };
  // tipoCliente siempre explícito: PM=1, PFAE=2. Si el usuario eligió uno en el form se respeta.
  const tipoCliente = values.tipoCliente ? Number(values.tipoCliente) : isPM ? 1 : 2;
  const domicilio = {
    direccion: values.domDireccion,
    ...(values.domColonia ? { coloniaOPoblacion: values.domColonia } : {}),
    ...(values.domCiudad ? { ciudad: values.domCiudad } : {}),
    ...(values.domMunicipio ? { alcaldiaOMunicipio: values.domMunicipio } : {}),
    codigoPostal: values.domCP,
    estado: values.domEstado,
    paisDeOrigenDelDomicilio: values.domPais || 'MX',
  };
  const persona = isPM
    ? {
        ...base,
        tipoCliente,
        ...(values.razonSocial ? { razonSocial: values.razonSocial } : {}),
        domicilio,
      }
    : {
        ...base,
        tipoCliente,
        ...(values.nombre ? { nombre: values.nombre } : {}),
        ...(values.segundoNombre ? { segundoNombre: values.segundoNombre } : {}),
        ...(values.apellidoPaterno ? { apellidoPaterno: values.apellidoPaterno } : {}),
        ...(values.apellidoMaterno ? { apellidoMaterno: values.apellidoMaterno } : {}),
        ...(values.apellidoAdicional ? { apellidoAdicional: values.apellidoAdicional } : {}),
        ...(values.curp ? { curp: values.curp } : {}),
        ...(values.fechaDeNacimiento
          ? { fechaDeNacimiento: fnsFormat(parseISO(values.fechaDeNacimiento), 'ddMMyyyy') }
          : {}),
        ...(values.nacionalidad ? { nacionalidad: values.nacionalidad } : {}),
        domicilio,
      };
  return {
    persona,
    firmaDeAutorizacionDelCliente: 'S',
    ambiguedad: 'R',
    indicadorScore: values.indicadorScore ?? 'S',
    codigoScore: values.codigoScore ?? '009',
    ...(isPM ? { indicadorVariablesCalificador: 'S' } : { indicadorVariablesCalifica: 'S' }),
  };
}

// ─── Combobox con búsqueda ────────────────────────────────────────────────────

interface SelectOption { value: string; label: string; secondary?: string }

function SearchableSelect({
  options, value, onChange, onBlur, label, placeholder, loading, disabled, error, helperText,
}: {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  onBlur?: (() => void) | undefined;
  label: string;
  placeholder?: string | undefined;
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  helperText?: string | undefined;
}) {
  const selected = options.find((opt) => opt.value === value) ?? null;
  return (
    <Autocomplete<SelectOption>
      options={options}
      loading={loading === true}
      disabled={disabled === true}
      value={selected}
      onChange={(_, newValue) => onChange(newValue?.value ?? '')}
      onBlur={onBlur}
      getOptionLabel={(opt) => opt.label}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.toLowerCase().trim();
        if (!q) return opts;
        return opts.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            (opt.secondary?.toLowerCase().includes(q) ?? false),
        );
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box key={key} component="li" {...optionProps} sx={{ py: '10px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>{option.label}</Typography>
              {option.secondary && (
                <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: 'rgba(0,0,0,0.06)', fontFamily: 'monospace', fontSize: '0.68rem', color: 'text.secondary', flexShrink: 0, lineHeight: 1.8, letterSpacing: '0.04em' }}>
                  {option.secondary}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={({ id, disabled: d, fullWidth, InputProps, inputProps, InputLabelProps }) => (
        <TextField
          id={id} disabled={d} fullWidth={fullWidth} label={label}
          {...(placeholder !== undefined ? { placeholder } : {})}
          error={error === true} helperText={helperText}
          slotProps={{
            input: {
              ...InputProps,
              endAdornment: (
                <>
                  {loading === true && <CircularProgress color="inherit" size={14} sx={{ mr: 0.5 }} />}
                  {InputProps.endAdornment}
                </>
              ),
            },
            htmlInput: inputProps,
            inputLabel: InputLabelProps,
          }}
        />
      )}
      noOptionsText="Sin resultados"
      loadingText="Cargando opciones…"
      slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2, mt: 0.5 } } }}
    />
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ step, icon, title, children }: { step: number; icon: string; title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: `${theme.palette.primary.main}08`, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 26, height: 26, borderRadius: '50%', background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{step}</Typography>
        </Box>
        <Icon icon={icon} width={15} color={theme.palette.primary.main} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ConsultaPage() {
  const theme = useTheme();
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('reporte');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastRFC, setLastRFC] = useState('');
  const [consultaId, setConsultaId] = useState<number | null>(null);

  const {
    control, register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoConsulta: 'PM', tipoCliente: '1', indicadorScore: 'S', codigoScore: '009', domPais: 'MX' },
  });

  // tipoConsulta viene directo del form — única fuente de verdad para UI, routing y payload.
  const tipoConsulta = watch('tipoConsulta');

  const reportePMMutation      = useConsultarReportePM();
  const informePMMutation      = useConsultarInformeBuro();
  const perfiladorPMMutation   = useConsultarPerfilador();
  const reportePFAEMutation    = useConsultarReportePFAE();
  const informePFAEMutation    = useConsultarInformeBuroPFAE();
  const perfiladorPFAEMutation = useConsultarPerfiladorPFAE();

  // activeMutation solo selecciona PFAE si el flag está habilitado Y tipoConsulta es PFAE.
  // Evita que errores/datos de mutaciones PFAE sean visibles cuando el flag está apagado.
  const activeMutation = (() => {
    if (pfaeAvailable && tipoConsulta === 'PFAE') {
      if (tipoReporte === 'informe')    return informePFAEMutation;
      if (tipoReporte === 'perfilador') return perfiladorPFAEMutation;
      return reportePFAEMutation;
    }
    if (tipoReporte === 'informe')    return informePMMutation;
    if (tipoReporte === 'perfilador') return perfiladorPMMutation;
    return reportePMMutation;
  })();

  const { isPending, error: mutError } = activeMutation;

  const { data: estados = [], isLoading: loadingEstados } = useEstados();
  const { data: paises = [], isLoading: loadingPaises } = usePaises();

  const estadoOptions = useMemo(
    () => estados.map((e) => ({ value: e.codigo, label: e.nombre, secondary: e.codigo })),
    [estados],
  );
  const paisOptions = useMemo(() => {
    const src = paises.length > 0 ? paises : [{ id: 0, codigo: 'MX', pais: 'México' }];
    return src.map((p) => ({ value: p.codigo, label: p.pais, secondary: p.codigo }));
  }, [paises]);

  // Si PFAE se deshabilita con el flag apagado, fuerza PM en el form.
  // pfaeAvailable es una constante de módulo — no es una dependencia reactiva.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pfaeAvailable && tipoConsulta === 'PFAE') {
      setValue('tipoConsulta', 'PM');
    }
  }, [tipoConsulta, setValue]);

  const resetAll = () => {
    reportePMMutation.reset();
    informePMMutation.reset();
    perfiladorPMMutation.reset();
    reportePFAEMutation.reset();
    informePFAEMutation.reset();
    perfiladorPFAEMutation.reset();
    setConsultaId(null);
    setDialogOpen(false);
  };

  const onSubmit = (values: FormValues) => {
    // Guard de seguridad: nunca llamar endpoints PFAE si el flag está apagado.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (values.tipoConsulta === 'PFAE' && !pfaeAvailable) return;

    const req = buildRequest(values);

    const rfc = values.rfc.toUpperCase();
    setLastRFC(rfc);
    setConsultaId(null);
    resetAll();
    const onSuccess = () => {
      setDialogOpen(true);
      fetchHistorial(rfc)
        .then((historial) => {
          const latest = [...historial].sort((a, b) => b.id - a.id).at(0);
          if (latest !== undefined) setConsultaId(latest.id);
        })
        .catch(() => { /* silencioso — el panel simplemente no aparece */ });
    };
    // Routing basado en values.tipoConsulta (form), no en el estado local,
    // para garantizar que request y endpoint siempre usen el mismo tipo.
    if (values.tipoConsulta === 'PFAE') {
      if (tipoReporte === 'informe')         informePFAEMutation.mutate(req, { onSuccess });
      else if (tipoReporte === 'perfilador') perfiladorPFAEMutation.mutate(req, { onSuccess });
      else                                   reportePFAEMutation.mutate(req, { onSuccess });
    } else {
      if (tipoReporte === 'informe')         informePMMutation.mutate(req, { onSuccess });
      else if (tipoReporte === 'perfilador') perfiladorPMMutation.mutate(req, { onSuccess });
      else                                   reportePMMutation.mutate(req, { onSuccess });
    }
  };

  const handleTipoChange = (_: React.MouseEvent, val: TipoConsulta | null) => {
    if (!val) return;
    setValue('tipoConsulta', val, { shouldValidate: true });
    // Auto-set tipoCliente según el tipo de persona: PM=1, PFAE=2
    setValue('tipoCliente', val === 'PM' ? '1' : '2');
  };

  const errorMsg = mutError instanceof Error ? mutError.message : mutError ? 'Error al consultar Buró de Crédito' : null;

  const dialogData = activeMutation.data;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 4, pb: 2.5, borderBottom: '2px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0, background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="eva:search-fill" width={22} color="#fff" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.dark" lineHeight={1.2}>
            Consulta Buró Empresas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reporte de crédito PM y PFAE vía Buró Empresas
          </Typography>
        </Box>
      </Box>

      {/* ── Formulario ── */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3} sx={{ mb: 3 }}>

          {/* Card 1 · Información General */}
          <SectionCard
            step={1}
            icon="eva:file-text-fill"
            title={tipoConsulta === 'PM' ? 'Información de la empresa' : 'Información de la persona'}
          >
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                Tipo de persona
              </Typography>
              <ToggleButtonGroup
                exclusive value={tipoConsulta} onChange={handleTipoChange} size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 3, py: 1.25, fontSize: '0.95rem', fontWeight: 500, borderColor: 'divider', color: 'text.secondary',
                    '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', borderColor: 'primary.main', fontWeight: 600, '&:hover': { bgcolor: 'primary.dark' } },
                    '&.Mui-disabled': { opacity: 0.45 },
                  },
                }}
              >
                <ToggleButton value="PM">
                  <Icon icon="eva:briefcase-fill" style={{ marginRight: 8 }} width={16} />
                  Persona Moral
                </ToggleButton>
                <Tooltip
                  title={!pfaeAvailable ? 'PFAE pendiente de habilitación' : ''}
                  placement="top"
                  arrow
                  disableHoverListener={pfaeAvailable}
                  disableFocusListener={pfaeAvailable}
                >
                  <span>
                    <ToggleButton value="PFAE" disabled={!pfaeAvailable}>
                      <Icon icon="eva:person-fill" style={{ marginRight: 8 }} width={16} />
                      PFAE
                    </ToggleButton>
                  </span>
                </Tooltip>
              </ToggleButtonGroup>
              {!pfaeAvailable && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Icon icon="eva:lock-fill" width={12} />
                  PFAE pendiente de habilitación — ver <code style={{ fontFamily: 'monospace' }}>VITE_PFAE_ENABLED</code>
                </Typography>
              )}
              {PFAE_MOCK_ENABLED && tipoConsulta === 'PFAE' && (
                <Alert severity="warning" variant="filled" icon={<Icon icon="eva:alert-triangle-fill" width={20} />} sx={{ mt: 1.5, borderRadius: 1.5, fontWeight: 600 }}>
                  MODO MOCK ACTIVO — PFAE responde con datos simulados. No se llaman endpoints reales.
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="RFC *" {...register('rfc')} error={!!errors.rfc}
                helperText={errors.rfc?.message ?? 'Ej: ABC123456XY1'}
                inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 2 } }}
                onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase(); }}
              />
              {tipoConsulta === 'PM' && (
                <TextField label="Razón Social *" {...register('razonSocial')} error={!!errors.razonSocial}
                  helperText={errors.razonSocial?.message ?? 'Solo letras, números y . & ( ) - /'} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Nombre(s) *" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Apellido Paterno *" {...register('apellidoPaterno')} error={!!errors.apellidoPaterno} helperText={errors.apellidoPaterno?.message} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Apellido Materno *" {...register('apellidoMaterno')} error={!!errors.apellidoMaterno} helperText={errors.apellidoMaterno?.message} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Apellido Adicional" {...register('apellidoAdicional')} error={!!errors.apellidoAdicional} helperText={errors.apellidoAdicional?.message} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Segundo Nombre" {...register('segundoNombre')} error={!!errors.segundoNombre} helperText={errors.segundoNombre?.message} />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="CURP" {...register('curp')} error={!!errors.curp}
                  helperText={errors.curp?.message ?? 'Ej: HAZJ800101HDFXXX01'}
                  inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' }, maxLength: 18 }}
                  onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase(); }}
                />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField
                  label="Fecha de Nacimiento"
                  type="date"
                  {...register('fechaDeNacimiento')}
                  error={!!errors.fechaDeNacimiento}
                  helperText={errors.fechaDeNacimiento?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
              {tipoConsulta === 'PFAE' && (
                <TextField label="Nacionalidad" {...register('nacionalidad')} error={!!errors.nacionalidad} helperText={errors.nacionalidad?.message} />
              )}
            </Box>
          </SectionCard>

          {/* Card 2 · Domicilio */}
          <SectionCard step={2} icon="eva:pin-fill" title="Domicilio">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Dirección *" {...register('domDireccion')} error={!!errors.domDireccion}
                helperText={errors.domDireccion?.message ?? 'Calle y número'} sx={{ gridColumn: '1 / -1' }} />
              <TextField label="Colonia" {...register('domColonia')} error={!!errors.domColonia} helperText={errors.domColonia?.message} />
              <TextField label="Ciudad" {...register('domCiudad')} error={!!errors.domCiudad} helperText={errors.domCiudad?.message} />
              <TextField label="Delegación / Municipio" {...register('domMunicipio')} error={!!errors.domMunicipio} helperText={errors.domMunicipio?.message} />
              <Controller name="domEstado" control={control} render={({ field }) => (
                <SearchableSelect options={estadoOptions} value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur}
                  label="Estado *" placeholder="Buscar estado…" loading={loadingEstados} disabled={loadingEstados}
                  error={!!errors.domEstado} helperText={errors.domEstado?.message} />
              )} />
              <TextField label="Código Postal *" {...register('domCP')} error={!!errors.domCP}
                helperText={errors.domCP?.message ?? '5 dígitos'} inputProps={{ maxLength: 5, inputMode: 'numeric' }} />
              <Controller name="domPais" control={control} render={({ field }) => (
                <SearchableSelect options={paisOptions} value={field.value ?? 'MX'} onChange={field.onChange} onBlur={field.onBlur}
                  label="País" placeholder="Buscar país…" loading={loadingPaises} disabled={loadingPaises} />
              )} />
            </Box>
          </SectionCard>

          {/* Accordion · Configuración Avanzada */}
          <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } }}>
            <AccordionSummary
              expandIcon={<Icon icon="eva:chevron-down-fill" width={18} color={theme.palette.primary.main} />}
              sx={{ px: 3, minHeight: 52, bgcolor: `${theme.palette.primary.main}08`, borderRadius: '8px', '&.Mui-expanded': { borderBottom: '1px solid', borderColor: 'divider', borderRadius: '8px 8px 0 0', minHeight: 52 }, '& .MuiAccordionSummary-content': { my: 1.25 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>3</Typography>
                </Box>
                <Icon icon="eva:star-fill" width={15} color={theme.palette.primary.main} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Configuración Avanzada
                </Typography>
                <Chip label="Opcional" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${theme.palette.primary.main}14`, color: 'primary.main', fontWeight: 600 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, py: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px 220px' }, gap: 2 }}>
                <Controller name="indicadorScore" control={control} render={({ field }) => (
                  <FormControl size="small">
                    <InputLabel>Indicador Score</InputLabel>
                    <Select label="Indicador Score" {...field} value={field.value ?? 'S'}>
                      <MenuItem value="S">S — Solicitar</MenuItem>
                      <MenuItem value="N">N — No solicitar</MenuItem>
                    </Select>
                  </FormControl>
                )} />
                <Controller name="codigoScore" control={control} render={({ field }) => (
                  <FormControl size="small">
                    <InputLabel>Código Score</InputLabel>
                    <Select label="Código Score" {...field} value={field.value ?? '009'}>
                      <MenuItem value="009">009 — Score PYME Plus</MenuItem>
                      <MenuItem value="011">011 — Score PYME Plus Variables</MenuItem>
                      <MenuItem value="012">012 — Score PYME Plus Sectorial</MenuItem>
                    </Select>
                  </FormControl>
                )} />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {/* ── Card 4 · Tipo de consulta + CTA ── */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: `${theme.palette.primary.main}08`, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '50%', background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>4</Typography>
            </Box>
            <Icon icon="eva:flash-fill" width={15} color={theme.palette.primary.main} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tipo de consulta
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
              Selecciona el reporte a generar
            </Typography>

            <ToggleButtonGroup
              exclusive value={tipoReporte}
              onChange={(_, val: TipoReporte | null) => val && setTipoReporte(val)}
              sx={{
                mb: 3, flexWrap: 'wrap', gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid !important',
                  borderColor: 'divider !important',
                  borderRadius: '8px !important',
                  mr: 0,
                },
                '& .MuiToggleButton-root': {
                  px: 3, py: 1.5, borderRadius: 2, fontWeight: 500, color: 'text.secondary',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 140,
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}10`,
                    color: 'primary.main',
                    borderColor: `${theme.palette.primary.main} !important`,
                    fontWeight: 600,
                    '&:hover': { bgcolor: `${theme.palette.primary.main}18` },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                },
              }}
            >
              {(Object.entries(TIPO_REPORTE_LABELS) as [TipoReporte, { label: string; icon: string }][]).map(
                ([key, { label, icon }]) => (
                  <ToggleButton key={key} value={key}>
                    <Icon icon={icon} width={22} />
                    <Typography variant="caption" fontWeight="inherit" sx={{ fontSize: '0.82rem', lineHeight: 1.3 }}>
                      {label}
                    </Typography>
                  </ToggleButton>
                ),
              )}
            </ToggleButtonGroup>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isPending}
              startIcon={
                isPending
                  ? <CircularProgress size={18} color="inherit" />
                  : <Icon icon={TIPO_REPORTE_LABELS[tipoReporte].icon} width={18} />
              }
              sx={{ minWidth: 240, minHeight: 52, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em', borderRadius: 2, boxShadow: 4 }}
            >
              {isPending ? 'Consultando…' : `Consultar ${TIPO_REPORTE_LABELS[tipoReporte].label}`}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* ── Error ── */}
      {errorMsg && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }} onClose={resetAll}
          icon={<Icon icon="eva:alert-circle-fill" width={22} />}>
          <Typography variant="body2" fontWeight={600}>Error en la consulta</Typography>
          <Typography variant="body2">{errorMsg}</Typography>
        </Alert>
      )}

      {/* ── Dialog de resultado ── */}
      <Dialog open={dialogOpen && !!dialogData} maxWidth="xl" fullWidth onClose={resetAll} scroll="paper">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, pr: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 1.5, flexShrink: 0, background: theme.brandGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={TIPO_REPORTE_LABELS[tipoReporte].icon} color="#fff" width={22} />
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              {TIPO_REPORTE_LABELS[tipoReporte].label}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={`RFC: ${lastRFC}`}
                size="small"
                sx={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1, bgcolor: `${theme.palette.primary.main}10`, color: 'primary.main' }}
              />
              <Chip
                label={tipoConsulta === 'PM' ? 'Persona Moral' : 'PFAE'}
                size="small"
                sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 600 }}
              />
            </Box>
          </Box>
          <IconButton onClick={resetAll} size="small" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
            <Icon icon="eva:close-fill" width={22} />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <RenderErrorBoundary label="preanálisis Drools">
            {consultaId !== null && (
              <BuroPreanalysisPanel consultaId={consultaId} autoRun />
            )}
          </RenderErrorBoundary>

          <RenderErrorBoundary label="resultado Buró">
            {dialogData && <ResultadoBuro data={dialogData} />}
          </RenderErrorBoundary>

          {import.meta.env.DEV && dialogData && (
            <Box component="details" sx={{ mt: 3 }}>
              <Box component="summary" sx={{ color: 'text.secondary', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                <Icon icon="eva:code-fill" width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                JSON completo (solo DEV)
              </Box>
              <Box component="pre" sx={{ mt: 1.5, p: 2.5, borderRadius: 2, overflow: 'auto', background: '#1e1e2e', color: '#89b4fa', fontSize: '0.75rem', maxHeight: 400, lineHeight: 1.6 }}>
                {JSON.stringify(dialogData, null, 2)}
              </Box>
            </Box>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={resetAll} startIcon={<Icon icon="eva:refresh-fill" width={16} />}>
            Nueva consulta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
