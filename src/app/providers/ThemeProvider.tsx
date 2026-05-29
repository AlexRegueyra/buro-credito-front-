import { useMemo } from 'react';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

import { guindaTheme, blueTheme } from '@shared/theme';
import { useUIStore } from '@shared/store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeVariant = useUIStore((s) => s.themeVariant);

  const theme = useMemo(
    () => (themeVariant === 'blue' ? blueTheme : guindaTheme),
    [themeVariant],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
