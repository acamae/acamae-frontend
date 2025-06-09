/**
 * Single source of truth for API error codes.
 * These codes are expected to be present in the `code` field of `ApiMessage`
 * when an API response indicates an error.
 */
export const ApiErrorCodes = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_ALREADY_EXISTS: 'AUTH_USER_ALREADY_EXISTS',
  AUTH_NO_ACTIVE_SESSION: 'AUTH_NO_ACTIVE_SESSION',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_LOGOUT_FAILED: 'AUTH_LOGOUT_FAILED',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Resource related
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // General Server Errors
  SERVER_ERROR: 'SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  REQUEST_ERROR: 'REQUEST_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // Network error (client-side detected)
  // Not typically sent by API in `ApiMessage.code` but used by client logic.
  CLIENT_NETWORK_ERROR: 'CLIENT_NETWORK_ERROR',
} as const;
