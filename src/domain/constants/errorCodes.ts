/**
 * Single source of truth for API error codes.
 * These codes are expected to be present in the `code` field of `ApiMessage`
 * when an API response indicates an error.
 */
export const ApiErrorCodes = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_ALREADY_EXISTS: 'AUTH_USER_ALREADY_EXISTS',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_USER_ALREADY_VERIFIED: 'AUTH_USER_ALREADY_VERIFIED',
  AUTH_NO_ACTIVE_SESSION: 'AUTH_NO_ACTIVE_SESSION',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_ALREADY_USED: 'AUTH_TOKEN_ALREADY_USED',
  AUTH_TOKEN_REVOKED: 'AUTH_TOKEN_REVOKED',
  AUTH_TOKEN_MALICIOUS: 'AUTH_TOKEN_MALICIOUS',
  AUTH_TOKEN_OTHER_FLOW: 'AUTH_TOKEN_OTHER_FLOW',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_UPDATE_FAILED: 'AUTH_UPDATE_FAILED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resource related
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Network errors (Axios codes that we actually handle)
  ERR_NETWORK: 'ERR_NETWORK',
  ERR_CANCELED: 'ERR_CANCELED',
  ECONNABORTED: 'ECONNABORTED',
  ETIMEDOUT: 'ETIMEDOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // Rate limit & availability
  AUTH_RATE_LIMIT: 'AUTH_RATE_LIMIT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // User related
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_USER_BLOCKED: 'AUTH_USER_BLOCKED',

  // Token & Session Management
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',

  // Database & Server
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;
