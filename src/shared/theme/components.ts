import { alpha, darken } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  // Buttons - Aumentados +15%
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 6,
        padding: '12px 28px',
        fontSize: '1.15rem',
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
      }),
      contained: ({ theme }) => ({
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }),
      containedPrimary: ({ theme }) => ({
        background: `linear-gradient(to bottom, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        '&:hover': {
          background: `linear-gradient(to bottom, ${darken(theme.palette.primary.dark, 0.12)} 0%, ${darken(theme.palette.primary.main, 0.12)} 100%)`,
        },
        '&.Mui-disabled': {
          background: 'rgba(0, 0, 0, 0.12)',
          color: 'rgba(0, 0, 0, 0.26)',
        },
      }),
      sizeSmall: {
        padding: '8px 18px',
        fontSize: '1rem',
      },
      sizeLarge: {
        padding: '14px 32px',
        fontSize: '1.3rem',
      },
    },
  },

  // Cards
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.85)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },

  // Paper
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.85)',
      },
      elevation1: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      },
      elevation2: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation3: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },

  // Chip - Aumentado +15%
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontSize: '1.075rem',
        fontWeight: 500,
        height: '37px',
      },
      colorPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff',
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
        },
      }),
      sizeSmall: {
        height: '30px',
        fontSize: '0.935rem',
      },
    },
  },

  // TextField - Aumentado +15%
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: 6,
          fontSize: '1.15rem',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '1.15rem',
        },
        '& .MuiInputBase-input': {
          fontSize: '1.15rem',
          padding: '14px 16px',
        },
      }),
    },
  },

  // Input - Aumentado +15%
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 6,
        fontSize: '1.15rem',
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
      }),
      input: {
        padding: '14px 16px',
        fontSize: '1.15rem',
      },
    },
  },

  // Dialog
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },

  // Alert
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      standardSuccess: {
        backgroundColor: '#e8f0ef',
        color: '#002F2A',
      },
      standardError: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
      },
      standardWarning: ({ theme }) => ({
        backgroundColor: '#f7f0dc',
        color: theme.palette.warning.dark,
      }),
      standardInfo: {
        backgroundColor: '#e8f0ef',
        color: '#002F2A',
      },
    },
  },

  // Table - Aumentado +15%
  MuiTableCell: {
    styleOverrides: {
      head: ({ theme }) => ({
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        color: theme.palette.primary.main,
        fontWeight: 600,
        fontSize: '1.15rem',
        padding: '16px 18px',
      }),
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontSize: '1.075rem',
        padding: '14px 18px',
      }),
    },
  },

  // IconButton - Aumentado +15%
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: 'all 0.2s ease',
        padding: '12px',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      }),
      sizeSmall: {
        padding: '8px',
      },
      sizeLarge: {
        padding: '16px',
      },
    },
  },

  // ToggleButton
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.dark, 0.08),
          color: theme.palette.primary.dark,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.dark, 0.12),
          },
        },
      }),
    },
  },

  // AppBar
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },

  // Tooltip
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#161A1D',
        fontSize: '0.75rem',
        borderRadius: 4,
      },
    },
  },
};
