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

  it('should validateToken formats', () => {
    // Valid UUID format
    expect(validateToken('6242aced-27e4-4c0d-979c-6f02ecb0eec1')).toBe(true);
    expect(validateToken('123e4567-e89b-12d3-a456-426614174000')).toBe(true);

    // Valid 64-character hexadecimal token
    const hexToken = 'a'.repeat(64);
    expect(validateToken(hexToken)).toBe(true);
    expect(validateToken('0123456789abcdef'.repeat(4))).toBe(true);

    // Invalid formats
    expect(validateToken('short')).toBe(false);
    expect(validateToken('')).toBe(false);
    expect(validateToken('6242aced-27e4-4c0d-979c')).toBe(false); // incomplete UUID
    expect(validateToken('x'.repeat(64))).toBe(false); // 64 chars but not hex
    expect(validateToken('6242aced27e44c0d979c6f02ecb0eec1')).toBe(false); // UUID without dashes
    expect(validateToken('123g4567-e89b-12d3-a456-426614174000')).toBe(false); // invalid hex char 'g'
  });
});
