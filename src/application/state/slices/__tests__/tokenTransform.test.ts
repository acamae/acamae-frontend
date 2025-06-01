import { encryptToken, decryptToken } from '@application/state/tokenTransform';

const SECRET_KEY = process.env.REACT_APP_TOKEN_SECRET || 'default_secret';

describe('tokenTransform', () => {
  it('encrypts the token on persist and decrypts it on rehydrate', () => {
    const originalToken = SECRET_KEY;
    const encrypted = encryptToken(originalToken);
    expect(encrypted).not.toBe(originalToken);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBeNull();

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('returns null if the token is null or undefined', () => {
    expect(encryptToken(null)).toBeNull();
    expect(encryptToken(undefined)).toBeNull();
    expect(decryptToken(null)).toBeNull();
    expect(decryptToken(undefined)).toBeNull();
  });

  it('returns null if decryption fails', () => {
    const invalidEncrypted = 'not-a-valid-encrypted-token';
    expect(decryptToken(invalidEncrypted)).toBeNull();
  });
});
