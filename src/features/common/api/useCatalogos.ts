import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@lib/axios';

import type { CatalogosResponse } from '../types';

/**
 * GET /adm/common/catalogos - Obtener catálogos del sistema
 * Incluye áreas y puestos
 */
export function useCatalogos() {
  return useQuery({
    queryKey: ['catalogos'],
    queryFn: async (): Promise<CatalogosResponse> => {
      const response = await apiClient.get('/adm/common/catalogos');
      const responseData = response.data as { CustomResponse?: CatalogosResponse } | undefined;
      const catalogos: CatalogosResponse = responseData?.CustomResponse ?? { areas: [], puestos: [] };
      return catalogos;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - los catálogos no cambian frecuentemente
  });
}
