/**
 * Configuración de roles y permisos del sistema
 *
 * Roles reconocidos:
 *   - administrador: rol admin (configurable por env var)
 *   - Unidades NAFIN:     TMF, UAF, UC, UDG, UERI, UGIRR, UIF, UJF, UPPEF, UTI
 *   - Unidades BANCOMEXT:  mismas abreviaturas + sufijo BMXT
 *   - Subdirectores:       subdirectorNF (NAFIN), subdirectorBMX (BANCOMEXT)
 *     Ven todas las unidades de su banco. Solo pueden crear en UAF.
 *     En otras unidades solo pueden editar el campo tipoRecurso.
 */

const administrador = import.meta.env.VITE_ROLE_ADMIN_ID || '';
const administradorNF = 'administradorNF';
const administradorBMX = 'administradorBMX';
const subdirectorNF = 'subdirectorNF';
const subdirectorBMX = 'subdirectorBMX';

const Roles = { administrador, administradorNF, administradorBMX, subdirectorNF, subdirectorBMX } as const;

/**
 * Todos los roles de unidad reconocidos por el sistema.
 * Estos valores son las abreviaturas que vienen en el token de Keycloak.
 */
const UNIT_ROLES: readonly string[] = [
  // NAFIN
  'TMF', 'UAF', 'UC', 'UDG', 'UERI', 'UGIRR', 'UIF', 'UJF', 'UPPEF', 'UTI', 'UPI',
  // BANCOMEXT (mismas abreviaturas + BMX)
  'UDGBMX', 'UAFBMX', 'UBEBMX', 'UCBMX', 'UGIRRBMX', 'UIFBMX', 'UJFBMX', 'UPPEFBMX', 'UTIBMX', 'TMFBMX',
  // Admins de banco
  administradorNF, administradorBMX,
  // Subdirectores (ven todas las unidades de su banco)
  subdirectorNF, subdirectorBMX,
];

/**
 * Obtener todos los roles permitidos del sistema como array
 * Filtra los valores vacíos
 */
export function getAllowedRoles(): string[] {
  return [administrador, ...UNIT_ROLES].filter(Boolean);
}

/**
 * Verificar si un rol está permitido en el sistema
 */
export function isAllowedRole(role: string): boolean {
  return getAllowedRoles().includes(role);
}

/**
 * Filtrar una lista de roles para obtener solo los permitidos en el sistema
 */
export function filterAllowedRoles(roles: string[]): string[] {
  const allowedRoles = getAllowedRoles();
  return roles.filter(role => allowedRoles.includes(role));
}

export default Roles;
