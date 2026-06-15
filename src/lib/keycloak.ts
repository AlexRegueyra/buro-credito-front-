import type { ServerUserInfo } from '@shared/types/auth.server.types';

// ─── Mock de autenticación para desarrollo local (sin Keycloak/BFF) ──────────
const IS_AUTH_MOCK = import.meta.env['VITE_AUTH_MOCK'] === 'true';

const MOCK_USER: ServerUserInfo = {
  userId: 'local-dev-user',
  username: 'dev.local',
  email: 'dev@buro-credito.local',
  displayName: 'Dev Local',
  primaryRole: 'buro-usuario',
  keycloakId: 'mock-keycloak-id',
  permissions: ['buro-usuario'],
};

/**
 * Redirige al BFF para iniciar el flujo Authorization Code + PKCE.
 * En modo mock (VITE_AUTH_MOCK=true) recarga la página para que AuthProvider
 * lea el usuario mock y entre directo al dashboard.
 */
export function login(): void {
  if (IS_AUTH_MOCK) {
    window.location.reload();
    return;
  }
  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';
  window.location.href = `${basePath}/auth/login`;
}

/**
 * Cierra la sesión: destruye la cookie en el BFF y redirige a KC logout.
 * En modo mock solo limpia el sessionStorage y redirige al root.
 */
export async function logout(): Promise<void> {
  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';

  try {
    localStorage.removeItem('auth-store');
    sessionStorage.removeItem('auth-store');
  } catch {
    // no es crítico
  }

  if (IS_AUTH_MOCK) {
    window.location.href = `${basePath}/`;
    return;
  }

  await fetch(`${basePath}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.location.href = `${basePath}/`;
}

/**
 * Obtiene el perfil del usuario autenticado desde el BFF.
 * En modo mock (VITE_AUTH_MOCK=true) devuelve MOCK_USER directamente.
 */
export async function fetchCurrentUser(): Promise<ServerUserInfo | null> {
  if (IS_AUTH_MOCK) {
    return Promise.resolve(MOCK_USER);
  }

  const projectName = import.meta.env.VITE_NAME_PROJECT as string | undefined;
  const basePath = projectName ? `/${projectName}` : '';

  const response = await fetch(`${basePath}/x-me`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401) {
    return null;
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
