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
 * Types of configuration for different types of forms
 */
export const THROTTLE_CONFIGS = {
  // Authentication forms (more strict)
  AUTH_FORMS: {
    delay: 4000, // 4 seconds
    maxAttempts: 3,
    timeWindow: 60000, // 1 minute
    persistInClient: true, // Persist in localStorage to avoid bypass with refresh
  },
  // Regular forms
  REGULAR_FORMS: {
    delay: 2000, // 2 seconds
    maxAttempts: 5,
    timeWindow: 60000, // 1 minute
    persistInClient: false, // No persist for better UX in regular forms
  },
  // Critical actions
  CRITICAL_ACTIONS: {
    delay: 8000, // 8 seconds
    maxAttempts: 2,
    timeWindow: 60000, // 1 minute
    persistInClient: true, // Persist for maximum security
  },
} as const;

/**
 * Configurations that require persistence in the client
 */
export const PERSISTENT_THROTTLE_CONFIGS = ['AUTH_FORMS', 'CRITICAL_ACTIONS'] as const;
