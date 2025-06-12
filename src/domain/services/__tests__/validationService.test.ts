import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateToken,
} from '@domain/services/validationService';

describe('validationService', () => {
  it('should validateEmail true/false', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('bad-email')).toBe(false);
  });

  it('should validatePassword strength', () => {
    expect(validatePassword('Abcdef12')).toBe(true);
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword()).toBe(false);
  });

  it('should validateUsername', () => {
    expect(validateUsername('user_name')).toBe(true);
    expect(validateUsername('no spaces allowed')).toBe(false);
  });

  it('should validateToken length', () => {
    const token = 'x'.repeat(64);
    expect(validateToken(token)).toBe(true);
    expect(validateToken('short')).toBe(false);
  });
});
