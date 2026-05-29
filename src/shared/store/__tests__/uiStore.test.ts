import { describe, it, expect, beforeEach } from 'vitest';

import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      sidebarOpen: true,
      theme: 'light',
      language: 'es',
      globalLoading: false,
    });
  });

  describe('sidebar', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();

      expect(useUIStore.getState().sidebarOpen).toBe(true);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);

      setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('theme', () => {
    it('should toggle theme', () => {
      const { toggleTheme } = useUIStore.getState();

      expect(useUIStore.getState().theme).toBe('light');

      toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');

      toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should set theme', () => {
      const { setTheme } = useUIStore.getState();

      setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');

      setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('language', () => {
    it('should set language', () => {
      const { setLanguage } = useUIStore.getState();

      expect(useUIStore.getState().language).toBe('es');

      setLanguage('en');
      expect(useUIStore.getState().language).toBe('en');

      setLanguage('es');
      expect(useUIStore.getState().language).toBe('es');
    });
  });

  describe('globalLoading', () => {
    it('should set global loading state', () => {
      const { setGlobalLoading } = useUIStore.getState();

      expect(useUIStore.getState().globalLoading).toBe(false);

      setGlobalLoading(true);
      expect(useUIStore.getState().globalLoading).toBe(true);

      setGlobalLoading(false);
      expect(useUIStore.getState().globalLoading).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      useUIStore.setState({
        sidebarOpen: true,
        theme: 'light',
        language: 'es',
        globalLoading: false,
      });

      const state = useUIStore.getState();

      expect(state.sidebarOpen).toBe(true);
      expect(state.theme).toBe('light');
      expect(state.language).toBe('es');
      expect(state.globalLoading).toBe(false);
    });
  });
});
