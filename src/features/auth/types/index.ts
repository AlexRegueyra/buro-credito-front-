import type { Status } from '@shared/types';

/**
 * Usuario autenticado
 */
export interface User {
  usrId: string;
  usrNombre: string;
  usrEmail: string;
  usrEstatus: Status;
  rolId: string;
  keycloakId?: string; // ID del usuario en Keycloak (para reset password)
  role?: {
    rolId: string;
    rolNombre: string;
    rolDescripcion?: string;
  };
  permissions?: string[];
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Respuesta del login
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Configuración de Keycloak
 */
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

/**
 * Tokens de autenticación
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
  idToken?: string;
}

/**
 * Session info
 */
export interface SessionInfo {
  isActive: boolean;
  expiresAt: number;
  lastActivity: number;
  warningThreshold: number; // minutes before expiry to show warning
}
