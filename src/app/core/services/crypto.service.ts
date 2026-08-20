import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  /**
   * Cifra como espera el backend Java:
   * AES/GCM/NoPadding + IV de 12 bytes + tag de 128 bits.
   * Resultado enviado: Base64(IV + ciphertext + authenticationTag).
   */
  async encryptSecret(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(environment.aesKey);

    if (keyBytes.length !== 32) {
      throw new Error('La clave AES debe tener exactamente 32 bytes (256 bits).');
    }

    const key = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: 128 }, key, encoder.encode(value)
    ));

    const payload = new Uint8Array(iv.length + encrypted.length);
    payload.set(iv, 0);
    payload.set(encrypted, iv.length);

    return this.toBase64(payload);
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }
}
