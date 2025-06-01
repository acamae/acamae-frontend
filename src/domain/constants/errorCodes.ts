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

  // Network error (client-side detected)
  // Not typically sent by API in `ApiMessage.code` but used by client logic.
  CLIENT_NETWORK_ERROR: 'CLIENT_NETWORK_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes];

/**
 * Single source of truth for API success codes.
 * These codes are expected to be present in the `code` field of `ApiMessage`
 * when an API response indicates a successful operation with a specific outcome.
 */
export const ApiSuccessCodes = {
  AUTH_LOGIN_SUCCESSFUL: 'AUTH_LOGIN_SUCCESSFUL',
  AUTH_REGISTRATION_SUCCESSFUL: 'AUTH_REGISTRATION_SUCCESSFUL',
  // Add other success codes as needed
  GENERAL_SUCCESS: 'GENERAL_SUCCESS',
} as const;

export type ApiSuccessCode = (typeof ApiSuccessCodes)[keyof typeof ApiSuccessCodes];

// Generic type for any code that might appear in ApiMessage.code
export type ApiMessageCode = ApiErrorCode | ApiSuccessCode;
