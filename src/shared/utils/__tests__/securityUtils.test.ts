import { THROTTLE_CONFIGS } from '@shared/constants/security';

import { securityThrottleService, generateActionId } from '../securityUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('securityThrottleService', () => {
  beforeEach(() => {
    securityThrottleService.clearAllThrottleStates();
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
      const result = securityThrottleService.canPerformAction(actionId);
      expect(result).toBe(true);
    });

    it('should block action within delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // First action should be allowed
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Second action within delay should be blocked
      jest.advanceTimersByTime(500);
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(false);
    });

    it('should allow action after delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // First action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay to pass
      jest.advanceTimersByTime(1000);

      // Second action after delay should be allowed
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);
    });

    it('should block action after max attempts', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 2, timeWindow: 60000 };

      // First action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay
      jest.advanceTimersByTime(1000);

      // Second action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay
      jest.advanceTimersByTime(1000);

      // Third action should be blocked (exceeds maxAttempts)
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(false);
    });

    it('should reset attempts after time window', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 2, timeWindow: 60000 };

      // First action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay
      jest.advanceTimersByTime(1000);

      // Second action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for time window to pass
      jest.advanceTimersByTime(60000);

      // Third action should be allowed after time window reset
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);
    });

    it('should block action when user is blocked', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000 };

      // First action
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true);

      // Wait for delay
      jest.advanceTimersByTime(1000);

      // Second action should block the user
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(false);

      // Additional attempts should still be blocked
      jest.advanceTimersByTime(1000);
      expect(securityThrottleService.canPerformAction(actionId, config)).toBe(false);
    });
  });

  describe('getThrottleState', () => {
    it('should return null for non-existent action', () => {
      const state = securityThrottleService.getThrottleState('non-existent');
      expect(state).toBeNull();
    });

    it('should return correct state for existing action', () => {
      const actionId = 'test-action';
      securityThrottleService.canPerformAction(actionId);

      const state = securityThrottleService.getThrottleState(actionId);
      expect(state).not.toBeNull();
      expect(state?.attemptCount).toBe(1);
      expect(state?.isBlocked).toBe(false);
    });
  });

  describe('clearThrottleState', () => {
    it('should clear specific action state', () => {
      const actionId = 'test-action';
      securityThrottleService.canPerformAction(actionId);

      expect(securityThrottleService.getThrottleState(actionId)).not.toBeNull();

      securityThrottleService.clearThrottleState(actionId);
      expect(securityThrottleService.getThrottleState(actionId)).toBeNull();
    });
  });

  describe('clearAllThrottleStates', () => {
    it('should clear all states', () => {
      const actionId1 = 'test-action-1';
      const actionId2 = 'test-action-2';

      securityThrottleService.canPerformAction(actionId1);
      securityThrottleService.canPerformAction(actionId2);

      expect(securityThrottleService.getThrottleState(actionId1)).not.toBeNull();
      expect(securityThrottleService.getThrottleState(actionId2)).not.toBeNull();

      securityThrottleService.clearAllThrottleStates();

      expect(securityThrottleService.getThrottleState(actionId1)).toBeNull();
      expect(securityThrottleService.getThrottleState(actionId2)).toBeNull();
    });
  });

  describe('getTimeUntilNextAction', () => {
    it('should return 0 for non-existent action', () => {
      const timeUntil = securityThrottleService.getTimeUntilNextAction('non-existent');
      expect(timeUntil).toBe(0);
    });

    it('should return correct time for delay period', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      securityThrottleService.canPerformAction(actionId, config);

      // Check immediately after action
      const timeUntil = securityThrottleService.getTimeUntilNextAction(actionId, config);
      expect(timeUntil).toBe(1000);

      // Check after some time has passed
      jest.advanceTimersByTime(500);
      const timeUntilAfter = securityThrottleService.getTimeUntilNextAction(actionId, config);
      expect(timeUntilAfter).toBe(500);
    });

    it('should return time until unblock for blocked user', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000 };

      // First action to reach max attempts
      securityThrottleService.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Second action to block user
      securityThrottleService.canPerformAction(actionId, config);

      const timeUntil = securityThrottleService.getTimeUntilNextAction(actionId, config);
      expect(timeUntil).toBeGreaterThan(55000); // Allow for some timing variance
      expect(timeUntil).toBeLessThanOrEqual(60000);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for non-existent action', () => {
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };
      const remaining = securityThrottleService.getRemainingAttempts('non-existent', config);
      expect(remaining).toBe(3);
    });

    it('should return correct remaining attempts', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // No actions yet
      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(3);

      // First action
      securityThrottleService.canPerformAction(actionId, config);
      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(2);

      // Second action
      jest.advanceTimersByTime(1000);
      securityThrottleService.canPerformAction(actionId, config);
      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(1);

      // Third action
      jest.advanceTimersByTime(1000);
      securityThrottleService.canPerformAction(actionId, config);
      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(0);
    });

    it('should return 0 for blocked user', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000 };

      // First action to reach max attempts
      securityThrottleService.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Second action to block user
      securityThrottleService.canPerformAction(actionId, config);

      const remaining = securityThrottleService.getRemainingAttempts(actionId, config);
      expect(remaining).toBe(0);
    });

    it('should reset remaining attempts after time window', () => {
      const actionId = 'test-action';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000 };

      // Use all attempts
      securityThrottleService.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);
      securityThrottleService.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);
      securityThrottleService.canPerformAction(actionId, config);

      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(0);

      // Wait for time window to pass
      jest.advanceTimersByTime(60000);

      // Should reset to max attempts
      expect(securityThrottleService.getRemainingAttempts(actionId, config)).toBe(3);
    });
  });

  describe('persistence functionality', () => {
    it('should persist auth form states to localStorage', () => {
      const actionId = 'login-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: true };

      securityThrottleService.canPerformAction(actionId, config);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'acamae-throttle-states',
        expect.stringContaining(actionId)
      );
    });

    it('should not persist regular form states', () => {
      const actionId = 'contact-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: false };

      securityThrottleService.canPerformAction(actionId, config);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should persist when user gets blocked', () => {
      const actionId = 'login-form-submit';
      const config = { delay: 1000, maxAttempts: 1, timeWindow: 60000, persistInClient: true };

      // First action
      securityThrottleService.canPerformAction(actionId, config);
      jest.advanceTimersByTime(1000);

      // Reset mock calls from first action
      localStorageMock.setItem.mockClear();

      // Second action should block and persist
      securityThrottleService.canPerformAction(actionId, config);

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
      securityThrottleService.clearAllThrottleStates();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('acamae-throttle-states');
    });

    it('should update storage when clearing specific persistent action', () => {
      const actionId1 = 'login-form-submit';
      const actionId2 = 'register-form-submit';
      const config = { delay: 1000, maxAttempts: 3, timeWindow: 60000, persistInClient: true };

      // Create multiple persistent states
      securityThrottleService.canPerformAction(actionId1, config);
      securityThrottleService.canPerformAction(actionId2, config);
      localStorageMock.setItem.mockClear();

      // Clear one specific action
      securityThrottleService.clearThrottleState(actionId1);

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
      securityThrottleService.canPerformAction(actionId, config);
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();

      // Clear the last action
      securityThrottleService.clearThrottleState(actionId);

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
    expect(THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts).toBe(3);
    expect(THROTTLE_CONFIGS.AUTH_FORMS.timeWindow).toBe(60000);
  });

  it('should have regular forms config', () => {
    expect(THROTTLE_CONFIGS.REGULAR_FORMS).toBeDefined();
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.delay).toBe(2000);
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.maxAttempts).toBe(5);
    expect(THROTTLE_CONFIGS.REGULAR_FORMS.timeWindow).toBe(60000);
  });

  it('should have critical actions config', () => {
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS).toBeDefined();
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.delay).toBe(8000);
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.maxAttempts).toBe(2);
    expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.timeWindow).toBe(60000);
  });
});

it('should update windowStart with current timestamp when unblocking after timeWindow', () => {
  const actionId = 'test-action';
  const config = { timeWindow: 100, maxAttempts: 2, delay: 0 };

  // Perform actions to trigger blocking (need 2 attempts to reach maxAttempts)
  expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true); // First attempt
  expect(securityThrottleService.canPerformAction(actionId, config)).toBe(true); // Second attempt
  expect(securityThrottleService.canPerformAction(actionId, config)).toBe(false); // Should be blocked after maxAttempts

  const state = securityThrottleService.getThrottleState(actionId);
  expect(state?.isBlocked).toBe(true);

  const originalWindowStart = state!.windowStart;

  // Wait for the timeWindow to pass and unblock
  return new Promise<void>(resolve => {
    setTimeout(() => {
      const newState = securityThrottleService.getThrottleState(actionId);
      expect(newState?.isBlocked).toBe(false);
      expect(newState?.attemptCount).toBe(0);
      expect(newState?.windowStart).toBeGreaterThan(originalWindowStart); // Should be updated with current time

      resolve();
    }, 150); // Wait longer than timeWindow (100ms)
  });
});
