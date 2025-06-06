import { AuthState } from '@domain/types/auth';
import { encryptToken, decryptToken } from '@application/state/tokenTransform';

describe('tokenTransform', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.REACT_APP_TOKEN_SECRET = 'test_secret';
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('encryptToken', () => {
    it('should return null for null input', async () => {
      expect(encryptToken(null)).toBeNull();
    });

    it('should return null for undefined input', async () => {
      expect(encryptToken(undefined)).toBeNull();
    });

    it('should return null for empty string', async () => {
      expect(encryptToken('')).toBeNull();
    });
  });

  describe('decryptToken', () => {
    it('should return null for null input', async () => {
      expect(decryptToken(null)).toBeNull();
    });

    it('should return null for undefined input', async () => {
      expect(decryptToken(undefined)).toBeNull();
    });

    it('should return null for empty string', async () => {
      expect(decryptToken('')).toBeNull();
    });

    it('should decrypt a valid encrypted token', async () => {
      const originalToken = 'test-token';
      const encrypted = encryptToken(originalToken);
      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(originalToken);
    });

    it('should return null for invalid encrypted token', async () => {
      const invalidToken = 'invalid-encrypted-token';
      expect(decryptToken(invalidToken)).toBeNull();
    });
  });

  describe('tokenTransform', () => {
    it('should be created with correct configuration', async () => {
      const { tokenTransform } = await import('../tokenTransform');
      expect(tokenTransform).toBeDefined();
      expect(typeof tokenTransform).toBe('object');
    });

    it('should encrypt and decrypt using the transform', async () => {
      const { encryptToken, decryptToken } = await import('../tokenTransform');
      const token = 'test-token';
      const encrypted = encryptToken(token);
      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(token);
    });
  });
});
