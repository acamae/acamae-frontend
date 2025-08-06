import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from '@shared/constants/validation';

/**
 * Valida el formato de un email.
 * @param email Email a validar
 * @returns true si el email es válido
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Valida la fortaleza de una contraseña.
 * Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número.
 * @param password Contraseña a validar
 * @returns true si la contraseña cumple los requisitos
 */
export const validatePassword = (password = ''): boolean => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Valida el formato de un nombre de usuario.
 * Solo letras, números y guiones bajos, 3-20 caracteres.
 * @param username Nombre de usuario a validar
 * @returns true si el nombre de usuario es válido
 */
export const validateUsername = (username: string): boolean => {
  return USERNAME_REGEX.test(username.trim());
};

/**
 * Valida un token de seguridad.
 * Acepta tanto UUIDs (36 caracteres con guiones) como tokens hexadecimales (64 caracteres).
 * @param token Token a validar
 * @returns true si el token cumple con alguno de los formatos esperados
 */
export const validateToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;

  const trimmedToken = token.trim();

  // Formato UUID: 8-4-4-4-12 caracteres hexadecimales separados por guiones
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (uuidRegex.test(trimmedToken)) {
    return true;
  }

  // Formato token hexadecimal: exactamente 64 caracteres hexadecimales
  const hexTokenRegex = /^[0-9a-fA-F]{64}$/;
  if (hexTokenRegex.test(trimmedToken)) {
    return true;
  }

  return false;
};
