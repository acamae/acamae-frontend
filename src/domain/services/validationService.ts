import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  USERNAME_REGEX,
  TOKEN_LENGTH,
} from '@shared/constants/validation';

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
export const validatePassword = (password: string): boolean => {
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
 * Valida un token de seguridad por longitud.
 * @param token Token a validar
 * @returns true si el token cumple con la longitud requerida
 */
export const validateToken = (token: string): boolean => {
  return token.trim().length === TOKEN_LENGTH;
};
