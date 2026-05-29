/**
 * Capa de autenticación del cliente (BFF mode).
 *
 * ANTES: Este archivo inicializaba keycloak-js en el browser, gestionaba tokens
 *        en memoria y los exponía en la pestaña Network.
 *
 * AHORA: El BFF (Node.js) gestiona el flujo OIDC completo y los tokens.
 *        El browser solo sabe que tiene una cookie HttpOnly (__sid).
 *        Este archivo es un stub delgado que habla con el BFF.
 *
 * Lo que desapareció:
 *   - keycloakInstance (Keycloak.js)
 *   - initKeycloak / doInitKeycloak
 *   - getToken / getRefreshToken
 *   - silentCheckSsoRedirectUri
 *   - updateToken / setInterval de renovación
 *   - buildLogoutUrl / performLogoutRedirect
 *   Todo eso ahora lo hace src/server/routes/auth.routes.ts
 */

import type { ServerUserInfo } from '@shared/types/auth.server.types';

/**
 * Redirige al BFF para iniciar el flujo Authorization Code + PKCE.
 * El BFF redirige a Keycloak → el browser nunca conoce la URL interna.
 */
export function login(): void {
  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';
  window.location.href = `${basePath}/auth/login`;
}

/**
 * Cierra la sesión: destruye la cookie en el BFF y redirige a KC logout.
 * Usamos POST para protegerse de logout CSRF (links maliciosos no pueden hacer POST).
 */
export async function logout(): Promise<void> {
  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';

  // Limpiar el auth-store de localStorage antes de la redirección
  try {
    localStorage.removeItem('auth-store');
  } catch {
    // No es crítico si falla
  }

  // POST al BFF — el BFF invalida la sesión y redirige a Keycloak logout
  await fetch(`${basePath}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // incluir la cookie __sid
  });

  // La respuesta es un redirect 302 que el browser seguirá automáticamente.
  // fetch no sigue redirects a otras origins, así que redirigimos manualmente:
  window.location.href = `${basePath}/`;
}

/**
 * Obtiene el perfil del usuario autenticado desde el BFF.
 * El BFF valida la cookie __sid y devuelve el ServerUserInfo.
 * Devuelve null si no hay sesión activa (no autenticado).
 *
 * Reemplaza a: initKeycloak() + getUserInfo() + getToken()
 */
export async function fetchCurrentUser(): Promise<ServerUserInfo | null> {
  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';

  const response = await fetch(`${basePath}/x-me`, {
    credentials: 'include', // CRÍTICO: envía la cookie HttpOnly automáticamente
    headers: { 'Accept': 'application/json' },
  });

  if (response.status === 401) {
    return null; // No hay sesión activa
  }

  if (!response.ok) {
    throw new Error(`fetchCurrentUser: respuesta inesperada ${String(response.status)}`);
  }

  return response.json() as Promise<ServerUserInfo>;
}

/**
 * Registra actividad del usuario para extender la sesión.
 * En el nuevo modelo, la sesión tiene sliding window en el servidor:
 * cada request con la cookie __sid actualiza lastActivity en el sessionStore.
 * No se necesita una llamada explícita — es automático.
 *
 * @deprecated No es necesario llamar a esta función en el nuevo modelo.
 */
export function extendSession(): void {
  // No-op: el BFF renueva lastActivity en cada request autenticado
}
