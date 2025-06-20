/**
 * Minimum password length required
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Minimum username length
 */
export const USERNAME_MIN_LENGTH = 3;

/**
 * Maximum username length
 */
export const USERNAME_MAX_LENGTH = 20;

/**
 * Security token length
 */
export const TOKEN_LENGTH = 64;

/**
 * https://devina.io/redos-checker
 * https://github.com/sindresorhus/validator.js/blob/main/src/lib/isEmail.js
 * RegExp optimized to avoid exponential backtracking (S5852)
 * 1) The local part allows dots as long as they are not consecutive or at the beginning/end
 * 2) The domain applies a pattern of subdomains separated by dots, without including "." within each label
 * 3) Minimum 2 characters for TLD
 * Note: This expression seeks a balance between simplicity and adequate validation without the risk of ReDoS
 */
export const EMAIL_REGEX =
  /^[^\s@.]+(?:\.[^\s@.]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

/**
 * https://devina.io/redos-checker
 * RegExp optimized to avoid exponential backtracking (S5852)
 * 1) Minimum 8 characters, at least one uppercase letter, one lowercase letter and one number
 * 2) Now also allows special characters
 */
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{${MIN_PASSWORD_LENGTH},}$`
);

/**
 * https://devina.io/redos-checker
 * RegExp optimized to avoid exponential backtracking (S5852)
 * 1) Only letters, numbers and underscores, 3-20 characters
 */
export const USERNAME_REGEX = new RegExp(
  `^[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`
);
