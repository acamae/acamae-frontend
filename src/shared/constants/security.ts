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
    return Number(process.env[key]) || Number(defaultValue);
  } catch {
    return Number(defaultValue);
  }
};

/**
 * Types of configuration for different types of forms
 */
export const THROTTLE_CONFIGS = {
  // Authentication forms (more strict)
  AUTH_FORMS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '4000'), // Wait 4 seconds every attempt
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '10'), // Maximum number of attempts
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (5 minutes)
    persistInClient: true, // Persist in localStorage to avoid bypass with refresh
  },
  // Regular forms
  REGULAR_FORMS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '4000'), // Wait 4 seconds every attempt
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '10'), // Maximum number of attempts
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (15 minutes)
    persistInClient: false, // No persist for better UX in regular forms
  },
  // Critical actions
  CRITICAL_ACTIONS: {
    delay: getEnvVar('REACT_THROTTLE_DELAY_MS', '4000'), // Wait 4 seconds every attempt
    maxAttempts: getEnvVar('REACT_THROTTLE_MAX_ATTEMPTS', '10'), // Maximum number of attempts
    timeWindow: getEnvVar('REACT_THROTTLE_WINDOW_MS', '300000'), // Within time window in milliseconds (5 minutes)
    persistInClient: true, // Persist for maximum security
  },
} as const;

/**
 * Configurations that require persistence in the client
 */
export const PERSISTENT_THROTTLE_CONFIGS = ['AUTH_FORMS', 'CRITICAL_ACTIONS'] as const;
