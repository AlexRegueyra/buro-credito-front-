import type { PaletteOptions } from '@mui/material/styles';

export const bluePalette: PaletteOptions = {
  primary: {
    main: '#007393',
    dark: '#04667c',
    light: '#07bae2',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0c53b7',
    light: '#4d8de8',
    dark: '#0a3d8a',
    contrastText: '#ffffff',
  },
  success: {
    main: '#1E5B4F',
    light: '#4A7D73',
    dark: '#002F2A',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#A57F2C',
    light: '#E6D194',
    dark: '#7A5E1F',
    contrastText: '#ffffff',
  },
  error: {
    main: '#dc3545',
    light: '#e4606d',
    dark: '#c82333',
    contrastText: '#ffffff',
  },
  info: {
    main: '#007393',
    light: '#07bae2',
    dark: '#04667c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f9fc',
    paper: '#ffffff',
  },
  text: {
    primary: '#161A1D',
    secondary: '#4A4D50',
    disabled: '#98989A',
  },
  divider: '#d4e0f0',
  action: {
    active: '#007393',
    hover: 'rgba(0, 115, 147, 0.08)',
    selected: 'rgba(0, 115, 147, 0.16)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 115, 147, 0.12)',
  },
};

export const blueGradients = {
  primary: 'linear-gradient(135deg, #04667c 0%, #07bae2 100%)',
  primaryHorizontal: 'linear-gradient(90deg, #04667c 0%, #07bae2 100%)',
} as const;
