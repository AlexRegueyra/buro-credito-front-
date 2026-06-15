// PFAE habilitado por default. Para deshabilitarlo: VITE_PFAE_ENABLED=false en .env
export const PFAE_ENABLED = import.meta.env['VITE_PFAE_ENABLED'] !== 'false';
// Solo local: respuesta mock controlada (no llama endpoints reales). Default desactivado.
export const PFAE_MOCK_ENABLED = import.meta.env['VITE_PFAE_MOCK_ENABLED'] === 'true';
export const pfaeAvailable = PFAE_ENABLED || PFAE_MOCK_ENABLED;
