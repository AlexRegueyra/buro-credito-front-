import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

// Query keys factory for type-safe keys
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.roles.lists(), { filters }] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  menus: {
    all: ['menus'] as const,
    lists: () => [...queryKeys.menus.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.menus.lists(), { filters }] as const,
    details: () => [...queryKeys.menus.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.menus.details(), id] as const,
    user: () => [...queryKeys.menus.all, 'user'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.permissions.lists(), { filters }] as const,
    details: () => [...queryKeys.permissions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.permissions.details(), id] as const,
  },
  audit: {
    all: ['audit'] as const,
    lists: () => [...queryKeys.audit.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.audit.lists(), { filters }] as const,
  },
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.documents.lists(), { filters }] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    byUser: (rfc: string, productTypeId: string) =>
      [...queryKeys.documents.all, 'user', rfc, productTypeId] as const,
    content: (docId: string) => [...queryKeys.documents.all, 'content', docId] as const,
  },
  busqueda: {
    all: ['busqueda'] as const,
    results: (filtros: string) => [...queryKeys.busqueda.all, 'results', { filtros }] as const,
    documentos: (rfc: string) => [...queryKeys.busqueda.all, 'documentos', rfc] as const,
  },
  expediente: {
    all: ['expediente'] as const,
    dashboard: (rfc: string, piso?: string | null) => [...queryKeys.expediente.all, 'dashboard', rfc, piso ?? null] as const,
    informacionGeneral: (rfc: string, piso?: string | null) => [...queryKeys.expediente.all, 'informacion-general', rfc, piso ?? null] as const,
    visor: (rfc: string) => [...queryKeys.expediente.all, 'visor', rfc] as const,
  },
} as const;
