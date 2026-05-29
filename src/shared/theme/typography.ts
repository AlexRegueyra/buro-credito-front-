export function createTypography(primaryMain: string) {
  return {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),

    // Headers - Aumentados +15% adicional para mejor visibilidad
    h1: {
      fontSize: '3.45rem', // 3rem -> 3.45rem (+15%)
      fontWeight: 600,
      lineHeight: 1.2,
      color: primaryMain,
    },
    h2: {
      fontSize: '2.875rem', // 2.5rem -> 2.875rem (+15%)
      fontWeight: 600,
      lineHeight: 1.3,
      color: primaryMain,
    },
    h3: {
      fontSize: '2.3rem', // 2rem -> 2.3rem (+15%)
      fontWeight: 600,
      lineHeight: 1.4,
      color: primaryMain,
    },
    h4: {
      fontSize: '2rem', // 1.75rem -> 2rem (+15%)
      fontWeight: 600,
      lineHeight: 1.4,
      color: primaryMain,
    },
    h5: {
      fontSize: '1.725rem', // 1.5rem -> 1.725rem (+15%)
      fontWeight: 600,
      lineHeight: 1.5,
      color: primaryMain,
    },
    h6: {
      fontSize: '1.4375rem', // 1.25rem -> 1.4375rem (+15%)
      fontWeight: 600,
      lineHeight: 1.6,
      color: primaryMain,
    },

    // Body - Aumentados +15% adicional para mejor legibilidad
    body1: {
      fontSize: '1.3rem', // 1.125rem -> 1.3rem (+15%)
      lineHeight: 1.6,
      color: '#161A1D',
    },
    body2: {
      fontSize: '1.15rem', // 1rem -> 1.15rem (+15%)
      lineHeight: 1.5,
      color: '#4A4D50',
    },

    // Button - Aumentado +15%
    button: {
      fontSize: '1.15rem', // 1rem -> 1.15rem (+15%)
      fontWeight: 500,
      textTransform: 'none', // Sin mayúsculas automáticas
      letterSpacing: '0.02em',
    },

    // Caption & Overline - Aumentados +15%
    caption: {
      fontSize: '1rem', // 0.875rem -> 1rem (+15%)
      lineHeight: 1.66,
      color: '#4A4D50',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  } as const;
}

// backward compat — usado por el re-export en index.ts
export const typography = createTypography('#9B2247');
