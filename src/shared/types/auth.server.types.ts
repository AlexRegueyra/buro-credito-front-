/**
 * Contrato compartido entre el BFF (servidor) y el cliente React.
 *
 * REGLA: Este archivo NO puede importar nada de Node.js ni de browser APIs.
 * Es el único canal tipado por el que el servidor le habla al cliente.
 * Los tokens NUNCA aparecen aquí.
 */

// ─── Usuario visible en el cliente ───────────────────────────────────────────

/**
 * Subset seguro de los claims de Keycloak que el cliente puede conocer.
 * Diseñado para mapear directamente al `User` del authStore de Zustand:
 *   userId       → usrId
 *   displayName  → usrNombre
 *   email        → usrEmail
 *   primaryRole  → rolId
 *   keycloakId   → keycloakId
 *   permissions  → permissions  (roles filtrados del sistema)
 */
export interface ServerUserInfo {
  readonly userId: string;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  /** Rol principal (primer rol del sistema asignado al usuario) */
  readonly primaryRole: string;
  /** keycloak `sub` — solo para operaciones que lo requieran (ej: reset de contraseña) */
  readonly keycloakId: string;
  /**
   * Lista de roles del sistema filtrados desde el token de Keycloak.
   * Compatible con `authStore.user.permissions` — en este sistema roles === permisos.
   */
  readonly permissions: readonly string[];
}

// ─── Estado temporal durante el flujo PKCE (solo servidor) ───────────────────

/**
 * Se guarda en el sessionStore durante el inicio de sesión.
 * Nunca sale del servidor. Se destruye al consumirlo (one-time use).
 */
export interface PendingAuthState {
  readonly state: string;
  readonly codeVerifier: string;
  readonly createdAt: number; // epoch ms
}

// ─── Sesión completa en el servidor ──────────────────────────────────────────

/**
 * La entrada real del sessionStore.
 * `tokens` es mutable porque el refresh transparente los actualiza en memoria.
 * NUNCA se serializa al cliente ni se escribe en disco.
 */
export interface ServerSession {
  readonly sessionId: string;
  readonly user: ServerUserInfo;
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string | undefined;
    /** epoch ms en que expira el accessToken */
    expiresAt: number;
  };
  readonly createdAt: number;
  lastActivity: number;
}
