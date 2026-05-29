import { createTheme } from '@mui/material/styles';

import { components } from './components';
import { palette, brandGradients as guindaGradients, customColors } from './palette';
import { createTypography, typography } from './typography';
import { bluePalette, blueGradients } from './variants/blue';

// ─── Module augmentation ───────────────────────────────────────────────────────
// Extiende el tipo Theme de MUI para incluir brandGradients en toda la app.
declare module '@mui/material/styles' {
  interface Theme {
    brandGradients: {
      primary: string;
      primaryHorizontal: string;
    };
  }
  interface ThemeOptions {
    brandGradients?: {
      primary?: string;
      primaryHorizontal?: string;
    };
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ThemeVariant = 'guinda' | 'blue';

// ─── Configuración base compartida ────────────────────────────────────────────

const baseConfig = {
  components,
  spacing: 8,
  shape: { borderRadius: 8 },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
  },
  shadows: [
    'none',
    '0 1px 4px rgba(0, 0, 0, 0.08)',
    '0 2px 8px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.1)',
    '0 6px 16px rgba(0, 0, 0, 0.12)',
    '0 8px 20px rgba(0, 0, 0, 0.14)',
    '0 10px 24px rgba(0, 0, 0, 0.16)',
    '0 12px 28px rgba(0, 0, 0, 0.18)',
    '0 14px 32px rgba(0, 0, 0, 0.2)',
    '0 16px 36px rgba(0, 0, 0, 0.22)',
    '0 18px 40px rgba(0, 0, 0, 0.24)',
    '0 20px 44px rgba(0, 0, 0, 0.26)',
    '0 22px 48px rgba(0, 0, 0, 0.28)',
    '0 24px 52px rgba(0, 0, 0, 0.3)',
    '0 26px 56px rgba(0, 0, 0, 0.32)',
    '0 28px 60px rgba(0, 0, 0, 0.34)',
    '0 30px 64px rgba(0, 0, 0, 0.36)',
    '0 32px 68px rgba(0, 0, 0, 0.38)',
    '0 34px 72px rgba(0, 0, 0, 0.4)',
    '0 36px 76px rgba(0, 0, 0, 0.42)',
    '0 38px 80px rgba(0, 0, 0, 0.44)',
    '0 40px 84px rgba(0, 0, 0, 0.46)',
    '0 42px 88px rgba(0, 0, 0, 0.48)',
    '0 44px 92px rgba(0, 0, 0, 0.5)',
    '0 46px 96px rgba(0, 0, 0, 0.52)',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any,
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
};

// ─── Temas ────────────────────────────────────────────────────────────────────

export const guindaTheme = createTheme({
  ...baseConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typography: createTypography((palette.primary as any).main as string),
  palette,
  brandGradients: guindaGradients,
});

export const blueTheme = createTheme({
  ...baseConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typography: createTypography((bluePalette.primary as any).main as string),
  palette: bluePalette,
  brandGradients: blueGradients,
});

// Tema por defecto (guinda) para backward compat
export const theme = guindaTheme;

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { palette, typography, components, customColors };
export { blueGradients };

// brandGradients del tema guinda — conservado para compatibilidad
export { guindaGradients as brandGradients };
