/**
 * Utilidades para manejo de contraseñas
 * Coincide con la lógica del proyecto viejo
 */

import { cryptoService } from './crypto';

/**
 * Convierte una contraseña a Base64
 * (Usado en el proyecto viejo para enviar contraseñas al backend)
 * NOTA: Base64 NO es encriptación. Para datos sensibles usar cryptoService.
 */
export function convertPasswordToBase64(password: string): string {
  if (!password) return '';

  try {
    // En navegador moderno, usar btoa
    return btoa(password);
  } catch (error) {
    console.error('Error convirtiendo contraseña a Base64:', error);
    return '';
  }
}

/**
 * Decodifica una contraseña desde Base64
 * (Para validaciones)
 */
export function decodePasswordFromBase64(base64: string): string {
  if (!base64) return '';

  try {
    return atob(base64);
  } catch (error) {
    console.error('Error decodificando contraseña desde Base64:', error);
    return '';
  }
}

/**
 * Cifra datos sensibles usando encriptación AES-256-GCM + RSA-OAEP
 * @param data - Datos a cifrar (usuario, contraseña, etc.)
 * @returns Payload cifrado listo para enviar al backend
 */
export async function encryptSensitiveData(data: unknown) {
  return await cryptoService.encryptData(data);
}

/**
 * Cifra datos de usuario completos (para creación/actualización)
 * @param userData - Objeto con datos del usuario
 * @returns Payload cifrado con formato esperado por el backend
 */
export async function encryptUserData(userData: unknown) {
  return await cryptoService.encryptUserData(userData);
}

/**
 * Valida la complejidad de una contraseña
 */
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('La contraseña debe tener al menos 12 caracteres');
  }

  if (password.length > 50) {
    errors.push('La contraseña no puede exceder 50 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }

  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
