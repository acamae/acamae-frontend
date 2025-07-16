import { THROTTLE_CONFIGS } from '@shared/constants/security';

import { SecurityThrottleService, generateActionId } from '../securityUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock process.env
const originalEnv = process.env;

describe('SecurityThrottleService - Environment Variables', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv;
  });

  describe('getEnvVar function', () => {
    it('should handle zero values correctly', () => {
      // Test that setting REACT_THROTTLE_DELAY_MS to "0" works
      process.env.REACT_THROTTLE_DELAY_MS = '0';
      process.env.REACT_THROTTLE_MAX_ATTEMPTS = '1000'; // Valor alto para permitir muchas acciones
      process.env.REACT_THROTTLE_WINDOW_MS = '0';

      const service = new SecurityThrottleService();

      // The service should now use 0 values instead of falling back to defaults
      // We can verify this by checking that the service allows immediate actions
      // when delay is set to 0
      const actionId = generateActionId('test-form');

      // With delay = 0, should allow immediate consecutive actions
      expect(service.canPerformAction(actionId, { delay: 0 })).toBe(true);
      expect(service.canPerformAction(actionId, { delay: 0 })).toBe(true);
    });

    it('should handle undefined environment variables', () => {
      // Clear the environment variables
      delete process.env.REACT_THROTTLE_DELAY_MS;
      delete process.env.REACT_THROTTLE_MAX_ATTEMPTS;
      delete process.env.REACT_THROTTLE_WINDOW_MS;

      const service = new SecurityThrottleService();

      // Should use default values when env vars are undefined
      const actionId = generateActionId('test-form');

      // Should work with default configuration
      expect(service.canPerformAction(actionId)).toBe(true);
    });

    it('should handle null environment variables', () => {
      // Set environment variables to null
      process.env.REACT_THROTTLE_DELAY_MS = null as unknown as string;
      process.env.REACT_THROTTLE_MAX_ATTEMPTS = null as unknown as string;
      process.env.REACT_THROTTLE_WINDOW_MS = null as unknown as string;

      const service = new SecurityThrottleService();

      // Should use default values when env vars are null
      const actionId = generateActionId('test-form');

      // Should work with default configuration
      expect(service.canPerformAction(actionId)).toBe(true);
    });

    it('should handle empty string environment variables', () => {
      // Set environment variables to empty strings
      process.env.REACT_THROTTLE_DELAY_MS = '';
      process.env.REACT_THROTTLE_MAX_ATTEMPTS = '';
      process.env.REACT_THROTTLE_WINDOW_MS = '';

      const service = new SecurityThrottleService();

      // Should use default values when env vars are empty strings
      const actionId = generateActionId('test-form');

      // Should work with default configuration
      expect(service.canPerformAction(actionId)).toBe(true);
    });

    it('should handle mixed empty and valid environment variables', () => {
      // Set some variables to empty strings and others to valid values
      process.env.REACT_THROTTLE_DELAY_MS = '';
      process.env.REACT_THROTTLE_MAX_ATTEMPTS = '5';
      process.env.REACT_THROTTLE_WINDOW_MS = '';

      const service = new SecurityThrottleService();

      // Should use default values for empty strings and valid values for non-empty
      const actionId = generateActionId('test-form');

      // Should work with mixed configuration
      expect(service.canPerformAction(actionId)).toBe(true);
    });
  });
});

describe('SecurityThrottleService', () => {
  let service: SecurityThrottleService;

  beforeEach(() => {
    service = new SecurityThrottleService();
    service.clearAllThrottleStates();
    jest.clearAllTimers();
    jest.useFakeTimers();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('canPerformAction', () => {
    it('should allow first action', () => {
      const actionId = 'test-action';
      const result = service.canPerformAction(actionId);
      expect(result).toBe(true);
    });

    it('should block action within delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // First action should be allowed
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Second action within delay should be blocked
      jest.advanceTimersByTime(500);
      expect(service.canPerformAction(actionId, config)).toBe(false);
    });

    it('should allow action after delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // First action
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay to pass
      jest.advanceTimersByTime(1000);

      // Second action after delay should be allowed
      expect(service.canPerformAction(actionId, config)).toBe(true);
    });

    it('should block action after max attempts', () => {
      const actionId = 'test-action';
      const config = { delay: 0, maxAttempts: 2, timeWindow: 60000 };

      // First attempt should be allowed
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Second attempt should be allowed
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Third attempt should be blocked
      expect(service.canPerformAction(actionId, config)).toBe(false);
    });

    it('should reset attempts after time window', () => {
      const actionId = 'test-action';
      const config = { delay: 0, maxAttempts: 2, timeWindow: 60000 };

      // First attempt
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Second attempt (max reached)
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Third attempt (blocked)
      expect(service.canPerformAction(actionId, config)).toBe(false);

      // Advance time beyond window
      jest.advanceTimersByTime(70000);

      // Should be allowed again
      expect(service.canPerformAction(actionId, config)).toBe(true);
    });

    it('should block action when user is blocked', () => {
      const actionId = 'test-action';
      const config = { delay: 0, maxAttempts: 1, timeWindow: 60000 };

      // First attempt (allowed)
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Second attempt (blocked)
      expect(service.canPerformAction(actionId, config)).toBe(false);

      // Third attempt (still blocked)
      expect(service.canPerformAction(actionId, config)).toBe(false);
    });

    it('should handle zero delay throttling correctly', () => {
      const actionId = 'test-action';
      const config = { delay: 0, maxAttempts: 3, timeWindow: 60000 };

      // All attempts should be allowed until max is reached
      expect(service.canPerformAction(actionId, config)).toBe(true);
      expect(service.canPerformAction(actionId, config)).toBe(true);
      expect(service.canPerformAction(actionId, config)).toBe(true);
      expect(service.canPerformAction(actionId, config)).toBe(false);
    });

    it('should handle delayed throttling correctly', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // First attempt allowed
      expect(service.canPerformAction(actionId, config)).toBe(true);

      // Second attempt blocked due to delay
      expect(service.canPerformAction(actionId, config)).toBe(false);

      // Wait for delay to pass
      jest.advanceTimersByTime(1000);

      // Second attempt allowed after delay
      expect(service.canPerformAction(actionId, config)).toBe(true);
    });
  });

  describe('getThrottleState', () => {
    it('should return null for non-existent action', () => {
      const state = service.getThrottleState('non-existent');
      expect(state).toBeNull();
    });

    it('should return correct state for existing action', () => {
      const actionId = 'test-action';
      service.canPerformAction(actionId);

      const state = service.getThrottleState(actionId);
      expect(state).not.toBeNull();
      expect(state?.attemptCount).toBe(1);
      expect(state?.isBlocked).toBe(false);
    });
  });

  describe('clearThrottleState', () => {
    it('should clear specific action state', () => {
      const actionId = 'test-action';
      service.canPerformAction(actionId);

      expect(service.getThrottleState(actionId)).not.toBeNull();

      service.clearThrottleState(actionId);
      expect(service.getThrottleState(actionId)).toBeNull();
    });
  });

  describe('clearAllThrottleStates', () => {
    it('should clear all states', () => {
      const actionId1 = 'test-action-1';
      const actionId2 = 'test-action-2';

      service.canPerformAction(actionId1);
      service.canPerformAction(actionId2);

      expect(service.getThrottleState(actionId1)).not.toBeNull();
      expect(service.getThrottleState(actionId2)).not.toBeNull();

      service.clearAllThrottleStates();

      expect(service.getThrottleState(actionId1)).toBeNull();
      expect(service.getThrottleState(actionId2)).toBeNull();
    });
  });

  describe('getTimeUntilNextAction', () => {
    it('should return 0 for non-existent action', () => {
      const timeUntil = service.getTimeUntilNextAction('non-existent');
      expect(timeUntil).toBe(0);
    });

    it('should return correct time for delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      service.canPerformAction(actionId, config);

      // Check immediately after action
      const timeUntil = service.getTimeUntilNextAction(actionId, config);
      expect(timeUntil).toBe(1000);

      // Check after some time has passed
      jest.advanceTimersByTime(500);
      const timeUntilAfter = service.getTimeUntilNextAction(actionId, config);
      expect(timeUntilAfter).toBe(500);
    });

    it('should return time until unblock for blocked user', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000 };

      // First action to reach max attempts
      service.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Second action to block user
      service.canPerformAction(actionId, config);

      const timeUntil = service.getTimeUntilNextAction(actionId, config);
      expect(timeUntil).toBeGreaterThan(55000); // Allow for some timing variance
      expect(timeUntil).toBeLessThanOrEqual(60000);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for non-existent action', () => {
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };
      const remaining = service.getRemainingAttempts('non-existent', config);
      expect(remaining).toBe(3);
    });

    it('should return correct remaining attempts', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // No actions yet
      expect(service.getRemainingAttempts(actionId, config)).toBe(3);

      // First action
      service.canPerformAction(actionId, config);
      expect(service.getRemainingAttempts(actionId, config)).toBe(2);

      // Second action
      jest.advanceTimersByTime(1000);
      service.canPerformAction(actionId, config);
      expect(service.getRemainingAttempts(actionId, config)).toBe(1);

      // Third action
      jest.advanceTimersByTime(1000);
      service.canPerformAction(actionId, config);
      expect(service.getRemainingAttempts(actionId, config)).toBe(0);
    });

    it('should return 0 for blocked user', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000 };

      // First action to reach max attempts
      service.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Second action to block user
      service.canPerformAction(actionId, config);

      const remaining = service.getRemainingAttempts(actionId, config);
      expect(remaining).toBe(0);
    });

    it('should reset remaining attempts after time window', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // Use all attempts
      service.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);
      service.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);
      service.canPerformAction(actionId, config);

      expect(service.getRemainingAttempts(actionId, config)).toBe(0);

      // Wait for time window to pass
      jest.advanceTimersByTime(60000);

      // Should reset to max attempts
      expect(service.getRemainingAttempts(actionId, config)).toBe(3);
    });
  });

  describe('persistence functionality', () => {
    it('should persist auth form states to localStorage', () => {
      const actionId = 'login-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: true };

      service.canPerformAction(actionId, config);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'acamae-throttle-states',
        expect.stringContaining(actionId)
      );
    });

    it('should not persist regular form states', () => {
      const actionId = 'contact-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: false };

      service.canPerformAction(actionId, config);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should persist when user gets blocked', () => {
      const actionId = 'login-form-submit';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000, persistInClient: true };

      // First action
      service.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Reset mock calls from first action
      localStorageMock.setItem.mockClear();

      // Second action should block and persist
      service.canPerformAction(actionId, config);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'acamae-throttle-states',
        expect.stringContaining('"isBlocked":true')
      );
    });

    it('should load persisted states on initialization', () => {
      const actionId = 'login-form-submit';
      const mockState = {
        [actionId]: {
          lastSubmission: Date.now() - 5000,
          attemptCount: 2,
          windowStart: Date.now() - 10000,
          isBlocked: false,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));

      // Import the class directly
      const { SecurityThrottleService } = jest.requireActual('../securityUtils');
      const newService = new SecurityThrottleService();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('acamae-throttle-states');
      expect(newService.getThrottleState(actionId)).toMatchObject({
        attemptCount: 2,
        isBlocked: false,
      });
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      // Should not throw error and should create a working instance
      const { SecurityThrottleService } = jest.requireActual('../securityUtils');
      const newService = new SecurityThrottleService();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('acamae-throttle-states');

      // Verify the instance works correctly after handling corrupted storage
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: false };

      expect(newService.canPerformAction(actionId, config)).toBe(true);
    });

    it('should clear persisted states when clearing all', () => {
      service.clearAllThrottleStates();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('acamae-throttle-states');
    });

    it('should update storage when clearing specific persistent action', () => {
      const actionId1 = 'login-form-submit';
      const actionId2 = 'register-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: true };

      // Create multiple persistent states
      service.canPerformAction(actionId1, config);
      service.canPerformAction(actionId2, config);
      localStorageMock.setItem.mockClear();

      // Clear one specific action
      service.clearThrottleState(actionId1);

      // Should call setItem to update storage with remaining actions
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'acamae-throttle-states',
        expect.stringContaining(actionId2)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'acamae-throttle-states',
        expect.not.stringContaining(actionId1)
      );
    });

    it('should remove storage when clearing last persistent action', () => {
      const actionId = 'login-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: true };

      // Create a single persistent state
      service.canPerformAction(actionId, config);
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();

      // Clear the last action
      service.clearThrottleState(actionId);

      // Should remove storage completely
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('acamae-throttle-states');
    });
  });
});

describe('generateActionId', () => {
  it('should generate correct action ID with default action type', () => {
    const actionId = generateActionId('test-form');
    expect(actionId).toBe('test-form-submit');
  });

  it('should generate correct action ID with custom action type', () => {
    const actionId = generateActionId('test-form', 'custom-action');
    expect(actionId).toBe('test-form-custom-action');
  });
});

describe('THROTTLE_CONFIGS', () => {
  it('should have auth forms config', () => {
    expect(THROTTLE_CONFIGS.AUTH_FORMS).toBeDefined();
    expect(THROTTLE_CONFIGS.AUTH_FORMS.delay).toBe(4000);
    expect(THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts).toBe(10);
    expect(THROTTLE_CONFIGS.AUTH_FORMS.timeWindow).toBe(300000);
  });

  it('should have regular forms config', () => {
    expect(THROTTLE_CONFIGS.REGULAR_FORMS).toBeDefined();
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.delay).toBe(4000);
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.maxAttempts).toBe(10);
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.timeWindow).toBe(300000);
  });

  it('should have critical actions config', () => {
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS).toBeDefined();
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.delay).toBe(4000);
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.maxAttempts).toBe(10);
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.timeWindow).toBe(300000);
  });
});

describe('SecurityThrottleService - Time Window Reset', () => {
  let service: SecurityThrottleService;

  beforeEach(() => {
    service = new SecurityThrottleService();
    service.clearAllThrottleStates();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should update windowStart with current timestamp when unblocking after timeWindow', () => {
    const actionId = 'test-action';
    const config = { timeWindow: 100, maxAttempts: 2, delay: 0 };

    // Perform actions to trigger blocking (need 2 attempts to reach maxAttempts)
    expect(service.canPerformAction(actionId, config)).toBe(true); // First attempt
    expect(service.canPerformAction(actionId, config)).toBe(true); // Second attempt
    expect(service.canPerformAction(actionId, config)).toBe(false); // Should be blocked after maxAttempts

    const state = service.getThrottleState(actionId);
    expect(state?.isBlocked).toBe(true);

    const originalWindowStart = state!.windowStart;

    // Advance timers to trigger unblocking
    jest.advanceTimersByTime(150); // Wait longer than timeWindow (100ms)

    const newState = service.getThrottleState(actionId);
    expect(newState?.isBlocked).toBe(false);
    expect(newState?.attemptCount).toBe(0);
    expect(newState?.windowStart).toBeGreaterThan(originalWindowStart); // Should be updated with current time
  });
});
