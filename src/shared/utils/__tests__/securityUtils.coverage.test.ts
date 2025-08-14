import { SecurityThrottleService } from '@shared/utils/securityUtils';

describe('SecurityThrottleService (coverage helpers)', () => {
  it('should compute remaining attempts and time until next action', () => {
    const svc = new SecurityThrottleService();
    const id = 'test-form-submit';
    // default: first call allowed, maxAttempts default > 0
    expect(svc.getRemainingAttempts(id)).toBeGreaterThan(0);
    expect(typeof svc.getTimeUntilNextAction(id)).toBe('number');
    // record action then compute again
    svc.recordAction(id, { delay: 0 });
    expect(svc.getRemainingAttempts(id)).toBeGreaterThanOrEqual(0);
    // clear and ensure zeroed state
    svc.clearThrottleState(id);
    expect(svc.getThrottleState(id)).toBeNull();
  });
});
