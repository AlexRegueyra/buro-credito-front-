/**
 * Paleta de colores institucional gubernamental
 */

export const palette = {
  // Colores primarios (Guinda institucional)
  primary: {
    main: '#9B2247',
    light: '#C04E6F',
    dark: '#611232',
    contrastText: '#ffffff',
  },

  // Colores secundarios (Verde institucional)
  secondary: {
    main: '#1E5B4F',
    light: '#4A7D73',
    dark: '#002F2A',
    contrastText: '#ffffff',
  },

  // Estados
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
    main: '#1E5B4F',
    light: '#4A7D73',
    dark: '#002F2A',
    contrastText: '#ffffff',
  },

  // Backgrounds
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },

  // Textos
  text: {
    primary: '#161A1D',
    secondary: '#4A4D50',
    comment: '#161A1D',
    disabled: '#98989A',
  },

  // Dividers
  divider: '#d4d4d4',

  // Action colors
  action: {
    active: '#9B2247',
    hover: 'rgba(155, 34, 71, 0.08)',
    selected: 'rgba(155, 34, 71, 0.16)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(155, 34, 71, 0.12)',
  },
};

/**
 * Gradientes de marca — importar donde se necesite background de color institucional
 * en elementos no-Button (icon boxes, dialog headers, banners).
 * Los botones `variant="contained"` usan el override de tema automáticamente.
 */
export const brandGradients = {
  primary: 'linear-gradient(135deg, #611232 0%, #9B2247 100%)',
  primaryHorizontal: 'linear-gradient(90deg, #611232 0%, #9B2247 100%)',
} as const;

/**
 * Colores personalizados adicionales
 */
export const customColors = {
  backgroundLight: '#f5f5f5',
  backgroundMedium: '#fdf0f3',
  backgroundDark: '#d4d4d4',

  primaryLight: '#C04E6F',
  primaryDark: '#611232',

  secondaryLight: '#4A7D73',
  secondaryDark: '#002F2A',
};
