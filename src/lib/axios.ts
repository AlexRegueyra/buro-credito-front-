/**
 * Cliente HTTP del BFF mode.
 *
 * ANTES: Inyectaba `Authorization: Bearer <token>` en cada request.
 *        El token era visible en la pestaña Network del browser.
 *
 * AHORA: No hay token en el cliente.
 *        El browser envía la cookie HttpOnly (__sid) automáticamente gracias
 *        a `withCredentials: true`. El BFF la valida e inyecta el Bearer token
 *        server-side antes de reenviar al Gateway.
 *
 * BaseURL: `${basePath}/x-api` → todas las llamadas van al BFF en la misma origin
 *   bajo el prefijo opaco /x-api. El BFF lo stripea y enruta al Gateway interno.
 *   El browser nunca ve la URL real del backend ni el access_token.
 */

import axios, { type AxiosError } from 'axios';
import { logger } from './config';

const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
const basePath = projectName ? `/${projectName}` : '';

export const apiClient = axios.create({
  baseURL: `${basePath}/x-api`,
  timeout: 15_000,
  withCredentials: true,   // Envía la cookie __sid en cada request — NO hay Bearer token
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (requestConfig) => {
    // No inyectamos ningún token — la cookie viaja automáticamente con withCredentials
    logger.debug('API Request:', requestConfig.method?.toUpperCase(), requestConfig.url);
    return requestConfig;
  },
  (error: AxiosError) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  },
);

// ─── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => {
    logger.debug('API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    logger.error(
      'API Response Error:',
      error.response?.status,
      error.message,
      error.config?.url,
    );

    // 401 del BFF → sesión expirada o cookie inválida
    // El componente o el hook que reciba este error debe redirigir a /auth/login
    if (error.response?.status === 401) {
      logger.warn('Sesión expirada — redirigir a login');
      // No redirigimos aquí para no acoplar axios a la lógica de routing.
      // useAuth.ts maneja el 401 en initialize() y los hooks individuales lo propagan.
    }

    return Promise.reject(error);
  },
);
