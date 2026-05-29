import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ThemeVariant } from '@shared/theme';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme mode (light / dark)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Theme variant (identidad corporativa)
  themeVariant: ThemeVariant;
  setThemeVariant: (variant: ThemeVariant) => void;

  // Language
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Sidebar
        sidebarOpen: true,
        toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        // Theme mode
        theme: 'light',
        setTheme: (theme) => set({ theme }),
        toggleTheme: () =>
          set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

        // Theme variant
        themeVariant: 'blue',
        setThemeVariant: (themeVariant) => set({ themeVariant }),

        // Language
        language: 'es',
        setLanguage: (language) => set({ language }),

        // Loading
        globalLoading: false,
        setGlobalLoading: (globalLoading) => set({ globalLoading }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          themeVariant: state.themeVariant,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'UI Store' }
  )
);
