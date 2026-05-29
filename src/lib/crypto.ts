/**
 * CryptoService - Servicio de cifrado híbrido AES-GCM + RSA-OAEP
 *
 * Este servicio implementa un sistema de cifrado híbrido donde:
 * 1. Se genera una clave AES-256-GCM aleatoria
 * 2. Los datos se cifran con AES-GCM (cifrado simétrico rápido)
 * 3. La clave AES se cifra con RSA-OAEP usando la clave pública del servidor
 * 4. Se envían ambos: datos cifrados + clave cifrada
 *
 * El backend descifra la clave AES con su clave privada RSA, y luego
 * usa esa clave para descifrar los datos.
 */

import { apiClient } from './axios';
import { logger } from './config';

/**
 * Estructura del payload cifrado que se envía al backend
 */
export interface EncryptedPayload {
  encryptedData: string; // Datos cifrados con AES-GCM (base64)
  encryptedKey: string; // Clave AES cifrada con RSA (base64)
  iv: string; // Vector de inicialización (base64)
  algorithm: 'AES-GCM'; // Algoritmo usado para cifrar los datos
  keyAlgorithm: 'RSA-OAEP'; // Algoritmo usado para cifrar la clave
}

/**
 * Wrapper del payload cifrado esperado por el backend
 */
export interface EncryptedUserData {
  encryptedPayload: EncryptedPayload;
}

class CryptoService {
  private publicKey: string | null = null;
  private publicKeyTimestamp: number | null = null;
  private readonly PUBLIC_KEY_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene la llave pública del servidor
   * @returns Llave pública en formato PEM
   */
  async getPublicKey(): Promise<string> {
    // Verificar si tenemos una llave en caché válida
    if (this.publicKey && this.publicKeyTimestamp) {
      const now = Date.now();
      if (now - this.publicKeyTimestamp < this.PUBLIC_KEY_CACHE_TIME) {
        return this.publicKey;
      }
    }

    try {
      const response = await apiClient.get<
        | string
        | { publicKey: string }
        | { CustomResponse: { publicKey: string } }
        | { data: { publicKey: string } }
      >('/userldap/crypto/public-key');

      // Intentar obtener la llave pública de diferentes estructuras posibles
      let publicKey: string | null = null;

      if (typeof response.data === 'string') {
        publicKey = response.data;
      } else if ('publicKey' in response.data) {
        publicKey = response.data.publicKey;
      } else if ('CustomResponse' in response.data) {
        publicKey = response.data.CustomResponse.publicKey;
      } else if ('data' in response.data) {
        publicKey = response.data.data.publicKey;
      }

      if (!publicKey) {
        logger.error('Estructura de respuesta no reconocida:', response.data);
        throw new Error(
          'No se pudo obtener la llave pública del servidor - estructura de respuesta incorrecta'
        );
      }

      // Si la llave no tiene el formato PEM, agregarle los headers
      if (!publicKey.includes('BEGIN PUBLIC KEY')) {
        publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
        logger.debug('Agregando headers PEM a la llave pública');
      }

      this.publicKey = publicKey;
      this.publicKeyTimestamp = Date.now();

      logger.debug(
        'Llave pública obtenida correctamente (primeros 100 chars):',
        publicKey.substring(0, 100)
      );

      return this.publicKey;
    } catch (error) {
      logger.error('Error obteniendo llave pública:', error);
      throw new Error('No se pudo obtener la llave pública para cifrado');
    }
  }

  /**
   * Convierte una cadena PEM a ArrayBuffer
   * @param pem - Llave pública en formato PEM
   * @returns ArrayBuffer con los datos de la llave
   */
  private pemToArrayBuffer(pem: string): ArrayBuffer {
    // Eliminar headers y footers del PEM
    const pemContents = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    // Decodificar base64
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * Importa una llave pública RSA desde formato PEM
   * @param pemKey - Llave pública en formato PEM
   * @returns CryptoKey lista para usar con Web Crypto API
   */
  private async importRSAPublicKey(pemKey: string): Promise<CryptoKey> {
    try {
      const keyData = this.pemToArrayBuffer(pemKey);

      return await window.crypto.subtle.importKey(
        'spki',
        keyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['encrypt']
      );
    } catch (error) {
      logger.error('Error importando llave RSA:', error);
      throw new Error('Error al importar la llave pública RSA');
    }
  }

  /**
   * Genera una clave AES-256-GCM aleatoria
   * @returns CryptoKey lista para cifrado AES
   */
  private async generateAESKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Cifra datos con AES-GCM
   * @param aesKey - Clave AES
   * @param data - Datos a cifrar (JSON string)
   * @returns Objeto con datos cifrados e IV
   */
  private async encryptWithAES(
    aesKey: CryptoKey,
    data: string
  ): Promise<{ encryptedData: string; iv: string }> {
    try {
      // Generar IV aleatorio (12 bytes es el tamaño recomendado para GCM)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Convertir datos a ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Cifrar con AES-GCM
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128, // Tag de autenticación de 128 bits
        },
        aesKey,
        dataBuffer
      );

      // Convertir a base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
      const ivBase64 = btoa(String.fromCharCode(...iv));

      return {
        encryptedData: encryptedBase64,
        iv: ivBase64,
      };
    } catch (error) {
      logger.error('Error cifrando con AES:', error);
      throw new Error('Error al cifrar los datos con AES-GCM');
    }
  }

  /**
   * Cifra la clave AES con RSA-OAEP
   * @param rsaPublicKey - Clave pública RSA
   * @param aesKey - Clave AES a cifrar
   * @returns Clave AES cifrada en base64
   */
  private async encryptAESKeyWithRSA(
    rsaPublicKey: CryptoKey,
    aesKey: CryptoKey
  ): Promise<string> {
    try {
      // Exportar la clave AES como raw bytes
      const aesKeyData = await window.crypto.subtle.exportKey('raw', aesKey);

      // Cifrar la clave AES con RSA-OAEP
      const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        rsaPublicKey,
        aesKeyData
      );

      // Convertir a base64
      const encryptedKeyArray = new Uint8Array(encryptedKeyBuffer);
      return btoa(String.fromCharCode(...encryptedKeyArray));
    } catch (error) {
      logger.error('Error cifrando clave AES con RSA:', error);
      throw new Error('Error al cifrar la clave AES con RSA-OAEP');
    }
  }

  /**
   * Cifra un objeto de datos usando el esquema híbrido AES-GCM + RSA-OAEP
   * @param data - Datos a cifrar
   * @returns Objeto con datos cifrados y metadatos
   */
  async encryptData(data: unknown): Promise<EncryptedPayload> {
    try {
      // 1. Obtener la llave pública del servidor
      const pemPublicKey = await this.getPublicKey();
      const rsaPublicKey = await this.importRSAPublicKey(pemPublicKey);

      // 2. Generar clave AES aleatoria
      const aesKey = await this.generateAESKey();

      // 3. Cifrar los datos con AES-GCM
      const jsonData = JSON.stringify(data);
      const { encryptedData, iv } = await this.encryptWithAES(aesKey, jsonData);

      // 4. Cifrar la clave AES con RSA-OAEP
      const encryptedAESKey = await this.encryptAESKeyWithRSA(
        rsaPublicKey,
        aesKey
      );

      // 5. Retornar el paquete cifrado
      return {
        encryptedData, // Datos cifrados con AES-GCM (base64)
        encryptedKey: encryptedAESKey, // Clave AES cifrada con RSA (base64)
        iv, // Vector de inicialización (base64)
        algorithm: 'AES-GCM', // Algoritmo usado
        keyAlgorithm: 'RSA-OAEP', // Algoritmo para la clave
      };
    } catch (error) {
      logger.error('Error en el proceso de cifrado:', error);
      throw error;
    }
  }

  /**
   * Cifra los datos de un usuario para creación/actualización
   * @param userData - Datos del usuario
   * @returns Objeto con el payload cifrado esperado por el backend
   */
  async encryptUserData(userData: unknown): Promise<EncryptedUserData> {
    try {
      // TODOS los campos del usuario deben ser cifrados
      // Solo el backend debe poder ver los datos en texto plano
      const sensitiveData = { ...(userData as Record<string, unknown>) };

      // Si no hay datos, retornar objeto vacío con metadata
      if (
        typeof sensitiveData !== 'object' ||
        Object.keys(sensitiveData).length === 0
      ) {
        throw new Error('No hay datos para cifrar');
      }

      // Cifrar TODOS los datos del usuario
      const encrypted = await this.encryptData(sensitiveData);

      // Retornar el payload dentro de encryptedPayload
      // El backend espera: { encryptedPayload: { encryptedData, encryptedKey, iv, algorithm, keyAlgorithm } }
      return {
        encryptedPayload: encrypted,
      };
    } catch (error) {
      logger.error('Error cifrando datos de usuario:', error);
      throw new Error(
        'No se pudieron cifrar los datos del usuario. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Limpia la caché de la llave pública
   */
  clearPublicKeyCache(): void {
    this.publicKey = null;
    this.publicKeyTimestamp = null;
  }
}

// Exportar una instancia única (singleton)
export const cryptoService = new CryptoService();
