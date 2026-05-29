/**
 * Configuración centralizada de la aplicación
 * Lee las variables de entorno y las expone de forma tipada
 */

interface AppConfig {
  // API Configuration
  apiUrl: string;
  appName: string;
  appVersion: string;

  // Keycloak Configuration
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
    bypassKeycloak: boolean;
    mockToken: string | null;
  };

  // Feature Flags
  features: {
    debug: boolean;
    mockData: boolean;
    devtools: boolean;
  };

  // Session Configuration
  session: {
    timeout: number;
    warningBeforeTimeout: number;
  };

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Environment
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  isMock: boolean;
}

/**
 * Helper para leer variables de entorno con valor por defecto
 */
function getEnvVar(key: string, defaultValue: string): string {
  return (import.meta.env[key] as string | undefined) ?? defaultValue;
}

/**
 * Helper para leer variables de entorno booleanas
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key] as string | boolean | undefined;
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
}

/**
 * Helper para leer variables de entorno numéricas
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key] as string | undefined;
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Configuración de la aplicación
 */
export const config: AppConfig = {
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8080/api'),
  appName: getEnvVar('VITE_APP_NAME', 'Proyecto Base'),
  appVersion: getEnvVar('VITE_APP_VERSION', '2.0.0'),

  // Keycloak Configuration
  keycloak: {
    url: getEnvVar('VITE_KEYCLOAK_URL', 'http://localhost:8080/auth'),
    realm: getEnvVar('VITE_KEYCLOAK_REALM', 'sgc'),
    clientId: getEnvVar('VITE_KEYCLOAK_CLIENT_ID', 'sgc-client'),
    bypassKeycloak: getEnvBoolean('VITE_BYPASS_KEYCLOAK', false),
    mockToken: getEnvVar('VITE_MOCK_TOKEN', '') || null,
  },

  // Feature Flags
  features: {
    debug: getEnvBoolean('VITE_ENABLE_DEBUG', true),
    mockData: getEnvBoolean('VITE_ENABLE_MOCK_DATA', false),
    devtools: getEnvBoolean('VITE_ENABLE_DEVTOOLS', true),
  },

  // Session Configuration (convertir segundos a milisegundos si es necesario)
  session: {
    timeout: getEnvNumber('VITE_SESSION_TIMEOUT', 1800000), // 30 minutos por defecto
    warningBeforeTimeout: getEnvNumber('VITE_SESSION_WARNING', 120000), // 2 minutos por defecto
  },

  // Logging
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'debug') as AppConfig['logLevel']),

  // Environment flags
  isDevelopment: import.meta.env.DEV,
  isStaging: getEnvVar('NODE_ENV', 'development') === 'staging',
  isProduction: import.meta.env.PROD,
  isMock: getEnvBoolean('VITE_BYPASS_KEYCLOAK', false),
};

/**
 * Logger centralizado basado en el nivel de log configurado
 */
const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = logLevels[config.logLevel];

export const logger = {
  debug: (...args: unknown[]) => {
    if (currentLevel <= logLevels.debug) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (currentLevel <= logLevels.info) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (currentLevel <= logLevels.warn) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (currentLevel <= logLevels.error) {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', ...args);
    }
  },
};

// Log de configuración en desarrollo
if (config.isDevelopment && config.features.debug) {
  logger.debug('App Configuration:', {
    environment: import.meta.env.MODE,
    apiUrl: config.apiUrl,
    appName: config.appName,
    appVersion: config.appVersion,
    keycloakRealm: config.keycloak.realm,
    features: config.features,
  });
}
