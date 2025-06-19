import { encryptToken, decryptToken } from '@application/state/tokenTransform';

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
});
