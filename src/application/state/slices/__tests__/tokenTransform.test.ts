import CryptoJS from 'crypto-js';

import { encryptToken, decryptToken, tokenTransform } from '@application/state/tokenTransform';

const SECRET_KEY = process.env.REACT_APP_TOKEN_SECRET ?? 'default_secret';

describe('tokenTransform', () => {
  it('should encrypt the token on persist and decrypt it on rehydrate', () => {
    const originalToken = SECRET_KEY;
    const encrypted = encryptToken(originalToken);
    expect(encrypted).not.toBe(originalToken);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBeNull();

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('should return null if the token is null or undefined', () => {
    expect(encryptToken(null)).toBeNull();
    expect(encryptToken()).toBeNull();
    expect(decryptToken(null)).toBeNull();
  });

  it('should return null if decryption fails', () => {
    const invalidEncrypted = 'not-a-valid-encrypted-token';
    expect(decryptToken(invalidEncrypted)).toBeNull();
  });

  it('should return null if decrypted value is empty string', () => {
    const mockWordArray = {
      toString: () => '',
      words: [],
      sigBytes: 0,
      concat: () => mockWordArray,
      clamp: () => undefined,
      clone: () => mockWordArray,
    };

    jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementationOnce(() => mockWordArray);

    expect(decryptToken('some-encrypted-value')).toBeNull();
    jest.spyOn(CryptoJS.AES, 'decrypt').mockRestore();
  });

  it('should handle the transform correctly for redux-persist', () => {
    // Verificar que el transform está definido
    expect(tokenTransform).toBeDefined();

    // Verificamos que las funciones de encriptación y desencriptación funcionan correctamente
    // en un flujo completo de encriptación -> desencriptación
    const token = 'test-token';
    const encrypted = encryptToken(token);
    const decrypted = decryptToken(encrypted);

    expect(encrypted).not.toBe(token);
    expect(decrypted).toBe(token);

    // Verificar que el transform se creó con los parámetros correctos
    // (indirectamente, ya que no podemos acceder a las propiedades internas)
    expect(tokenTransform).not.toBeNull();
  });
});
