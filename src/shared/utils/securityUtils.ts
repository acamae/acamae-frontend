import { ThrottleConfig } from '@shared/constants/security';

export interface ThrottleState {
  lastSubmission: number;
  attemptCount: number;
  windowStart: number;
  isBlocked: boolean;
}

class SecurityThrottleService {
  private readonly throttleStates: Map<string, ThrottleState> = new Map();
  private readonly defaultConfig: ThrottleConfig = {
    delay: 1000, // 1 second minimum between clicks
    maxAttempts: 3, // maximum 3 attempts
    timeWindow: 60000, // in a 1 minute window
    persistInClient: false,
  };
  private readonly storageKey = 'acamae-throttle-states';

  constructor() {
    this.loadPersistedStates();
  }

  /**
   * Load persisted states from localStorage
   */
  private loadPersistedStates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        // Load only non-expired states
        Object.entries(data).forEach(([actionId, state]) => {
          const throttleState = state as ThrottleState;
          // Check if the state has not expired
          if (now - throttleState.windowStart < 300000) {
            // 5 minutos máximo
            this.throttleStates.set(actionId, throttleState);
          }
        });
      }
    } catch {
      // If there's an error loading, clean corrupted storage
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Persist critical states in localStorage
   */
  private persistCriticalStates(): void {
    try {
      const persistentStates: Record<string, ThrottleState> = {};

      this.throttleStates.forEach((state, actionId) => {
        // Only persist states that require persistence
        if (this.shouldPersistAction(actionId)) {
          persistentStates[actionId] = state;
        }
      });

      if (Object.keys(persistentStates).length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(persistentStates));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      // Error persisting - continue without persistence
      console.warn('Failed to persist throttle states:', error);
    }
  }

  /**
   * Check if an action should be persisted based on its configuration
   */
  private shouldPersistAction(actionId: string): boolean {
    // Check if the actionId corresponds to a persistent configuration
    return (
      actionId.includes('login-form') ||
      actionId.includes('register-form') ||
      actionId.includes('forgot-password-form') ||
      actionId.includes('reset-password-form') ||
      actionId.includes('email-verification-resend-form') ||
      actionId.includes('critical-')
    );
  }

  /**
   * Check if a configuration requires persistence
   */
  private requiresPersistence(config: Partial<ThrottleConfig>): boolean {
    return config.persistInClient === true;
  }

  /**
   * Check if an action is allowed based on throttling
   */
  canPerformAction(actionId: string, config?: Partial<ThrottleConfig>): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const state = this.throttleStates.get(actionId);

    if (!state) {
      // First time this action is executed
      const newState: ThrottleState = {
        lastSubmission: now,
        attemptCount: 1,
        windowStart: now,
        isBlocked: false,
      };
      this.throttleStates.set(actionId, newState);

      // Persist if necessary
      if (this.requiresPersistence(finalConfig)) {
        this.persistCriticalStates();
      }

      return true;
    }

    // Check if the button is blocked
    if (state.isBlocked) {
      return false;
    }

    // Check the minimum delay between clicks
    if (now - state.lastSubmission < finalConfig.delay) {
      return false;
    }

    // Reset the attempt count if the time window has passed
    if (now - state.windowStart > finalConfig.timeWindow) {
      state.attemptCount = 0;
      state.windowStart = now;
    }

    // Check the attempt limit
    if (state.attemptCount >= finalConfig.maxAttempts) {
      state.isBlocked = true;

      // Persist the block immediately if necessary
      if (this.requiresPersistence(finalConfig)) {
        this.persistCriticalStates();
      }

      // Unblock after the time window
      setTimeout(() => {
        state.isBlocked = false;
        state.attemptCount = 0;
        state.windowStart = now;

        // Persist the unblock if necessary
        if (this.requiresPersistence(finalConfig)) {
          this.persistCriticalStates();
        }
      }, finalConfig.timeWindow);

      return false;
    }

    // Update state
    state.lastSubmission = now;
    state.attemptCount += 1;
    this.throttleStates.set(actionId, state);

    // Persist if necessary
    if (this.requiresPersistence(finalConfig)) {
      this.persistCriticalStates();
    }

    return true;
  }

  /**
   * Get the current throttling state for an action
   */
  getThrottleState(actionId: string): ThrottleState | null {
    return this.throttleStates.get(actionId) || null;
  }

  /**
   * Clear the throttling state for an action
   */
  clearThrottleState(actionId: string): void {
    const hadPersistentAction = this.shouldPersistAction(actionId);
    this.throttleStates.delete(actionId);

    // If it was a persistent action, update the storage
    if (hadPersistentAction) {
      this.persistCriticalStates();
    }
  }

  /**
   * Clear all throttling states
   */
  clearAllThrottleStates(): void {
    this.throttleStates.clear();
    // Limpiar también el storage
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Clear the entire throttling storage (for debugging/admin)
   */
  clearPersistedStates(): void {
    localStorage.removeItem(this.storageKey);
    this.throttleStates.clear();
  }

  /**
   * Calculate the time remaining until the action is available again
   */
  getTimeUntilNextAction(actionId: string, config?: Partial<ThrottleConfig>): number {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = this.throttleStates.get(actionId);

    if (!state) return 0;

    const now = Date.now();
    const timeSinceLastSubmission = now - state.lastSubmission;
    const remainingDelay = finalConfig.delay - timeSinceLastSubmission;

    if (state.isBlocked) {
      const timeUntilUnblock = finalConfig.timeWindow - (now - state.windowStart);
      return Math.max(timeUntilUnblock, 0);
    }

    return Math.max(remainingDelay, 0);
  }

  /**
   * Get the number of attempts remaining before blocking
   */
  getRemainingAttempts(actionId: string, config?: Partial<ThrottleConfig>): number {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = this.throttleStates.get(actionId);

    // If the action is not in the state, return the max attempts
    if (!state) {
      return finalConfig.maxAttempts;
    }

    // If the action is blocked, return 0
    if (state.isBlocked) {
      return 0;
    }

    // Reset the attempt count if the time window has passed
    const now = Date.now();
    if (now - state.windowStart > finalConfig.timeWindow) {
      return finalConfig.maxAttempts;
    }

    // Return the remaining attempts
    return Math.max(finalConfig.maxAttempts - state.attemptCount, 0);
  }
}

// Export the class for testing
export { SecurityThrottleService };

// Singleton instance
export const securityThrottleService = new SecurityThrottleService();

/**
 * Genera un ID único para una acción basándose en el contexto
 */
export const generateActionId = (formName: string, actionType: string = 'submit'): string => {
  return `${formName}-${actionType}`;
};
