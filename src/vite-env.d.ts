/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_NAME_PROJECT: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
  readonly VITE_BYPASS_KEYCLOAK: string;
  readonly VITE_MOCK_TOKEN: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_SESSION_WARNING_BEFORE_TIMEOUT: string;
  readonly VITE_AMBIENTE: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_ROLE_ADMIN_ID: string;
  /** @deprecated Usar bloqueos configurables desde el API (/portafolio/config/bloqueos) */
  readonly VITE_EDIT_DEADLINE: string;
  readonly VITE_MOCK: string;
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_MOCK_GQL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
