/**
 * Different types of throttling configurations for different types of forms and actions
 * These configurations control the frequency of submissions to prevent DDoS attacks
 */

export interface ThrottleConfig {
  delay: number;
  maxAttempts: number;
  timeWindow: number;
  persistInClient?: boolean;
}

/**
 * Safe function to get environment variables with fallback
 * This prevents errors when process.env is not available during module loading
 */
const getEnvVar = (key: string, defaultValue: string): number => {
  try {
    // In test environment, use hardcoded values for consistent testing
    if (process.env.NODE_ENV === 'test') {
      return Number(defaultValue);
    }

    const envValue = process.env[key];
    // Check if the environment variable exists, is not undefined, and is not an empty string
    if (envValue !== undefined && envValue !== null && envValue !== '') {
      return Number(envValue);
    }
    return Number(defaultValue);
  } catch {
    return Number(defaultValue);
  }
};

/**
 * Types of configuration for different types of forms
 *
 * Security differentiation implemented with minimal value changes:
 * - AUTH_FORMS: Stricter settings for authentication security
 * - REGULAR_FORMS: More permissive for better UX
 * - CRITICAL_ACTIONS: Strictest settings for critical operations
 */
export const THROTTLE_CONFIGS = {
  // Authentication forms (more strict)
  AUTH_FORMS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '4000'), // Wait 4 seconds every attempt
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '8'), // Maximum number of attempts (stricter)
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (5 minutes)
    persistInClient: true, // Persist in localStorage to avoid bypass with refresh
  },
  // Regular forms
  REGULAR_FORMS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '3000'), // Wait 3 seconds every attempt (more permissive)
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '12'), // Maximum number of attempts (more permissive)
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (5 minutes)
    persistInClient: false, // No persist for better UX in regular forms
  },
  // Critical actions
  CRITICAL_ACTIONS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '5000'), // Wait 5 seconds every attempt (strictest)
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '5'), // Maximum number of attempts (strictest)
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (5 minutes)
    persistInClient: true, // Persist for maximum security
  },
} as const;

/**
 * Configurations that require persistence in the client
 */
export const PERSISTENT_THROTTLE_CONFIGS = ['AUTH_FORMS', 'CRITICAL_ACTIONS'] as const;
