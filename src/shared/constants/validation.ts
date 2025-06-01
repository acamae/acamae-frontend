/**
 * Constantes para validación
 */

/**
 * Mínima longitud de contraseña requerida
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Longitud mínima de nombre de usuario
 */
export const USERNAME_MIN_LENGTH = 3;

/**
 * Longitud máxima de nombre de usuario
 */
export const USERNAME_MAX_LENGTH = 20;

/**
 * Longitud de token de seguridad
 */
export const TOKEN_LENGTH = 64;

/**
 * Expresión regular para validar emails
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Expresión regular para validar contraseñas seguras
 * Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número
 * Ahora también permite caracteres especiales
 */
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{${MIN_PASSWORD_LENGTH},}$`
);

/**
 * Expresión regular para validar nombres de usuario
 * Solo letras, números y guiones bajos, 3-20 caracteres
 */
export const USERNAME_REGEX = new RegExp(
  `^[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`
);
