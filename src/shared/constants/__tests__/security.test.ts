import { THROTTLE_CONFIGS, ThrottleConfig } from '../security';

describe('Security Constants', () => {
  describe('THROTTLE_CONFIGS', () => {
    it('should have AUTH_FORMS configuration', () => {
      expect(THROTTLE_CONFIGS.AUTH_FORMS).toBeDefined();
      expect(THROTTLE_CONFIGS.AUTH_FORMS.delay).toBe(4000);
      expect(THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts).toBe(3);
      expect(THROTTLE_CONFIGS.AUTH_FORMS.timeWindow).toBe(60000);
      expect(THROTTLE_CONFIGS.AUTH_FORMS.persistInClient).toBe(true);
    });

    it('should have REGULAR_FORMS configuration', () => {
      expect(THROTTLE_CONFIGS.REGULAR_FORMS).toBeDefined();
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.delay).toBe(2000);
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.maxAttempts).toBe(5);
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.timeWindow).toBe(60000);
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.persistInClient).toBe(false);
    });

    it('should have CRITICAL_ACTIONS configuration', () => {
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS).toBeDefined();
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.delay).toBe(8000);
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.maxAttempts).toBe(2);
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.timeWindow).toBe(60000);
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.persistInClient).toBe(true);
    });

    it('should have all required properties for each configuration', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        expect(config).toHaveProperty('delay');
        expect(config).toHaveProperty('maxAttempts');
        expect(config).toHaveProperty('timeWindow');

        expect(typeof config.delay).toBe('number');
        expect(typeof config.maxAttempts).toBe('number');
        expect(typeof config.timeWindow).toBe('number');

        expect(config.delay).toBeGreaterThan(0);
        expect(config.maxAttempts).toBeGreaterThan(0);
        expect(config.timeWindow).toBeGreaterThan(0);
      });
    });

    it('should have AUTH_FORMS with stricter settings than REGULAR_FORMS', () => {
      // Auth forms should have longer delay and fewer attempts for higher security
      expect(THROTTLE_CONFIGS.AUTH_FORMS.delay).toBeGreaterThan(
        THROTTLE_CONFIGS.REGULAR_FORMS.delay
      );
      expect(THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts).toBeLessThan(
        THROTTLE_CONFIGS.REGULAR_FORMS.maxAttempts
      );
    });

    it('should have CRITICAL_ACTIONS with strictest settings', () => {
      // Critical actions should have the longest delay and fewest attempts
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.delay).toBeGreaterThan(
        THROTTLE_CONFIGS.AUTH_FORMS.delay
      );
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.maxAttempts).toBeLessThanOrEqual(
        THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts
      );
    });

    it('should have persistent configurations correctly marked', () => {
      // AUTH_FORMS and CRITICAL_ACTIONS should be persistent
      expect(THROTTLE_CONFIGS.AUTH_FORMS.persistInClient).toBe(true);
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.persistInClient).toBe(true);

      // REGULAR_FORMS should not be persistent for better UX
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.persistInClient).toBe(false);
    });
  });

  describe('ThrottleConfig interface', () => {
    it('should accept valid throttle configuration', () => {
      const validConfig: ThrottleConfig = {
        delay: 1000,
        maxAttempts: 3,
        timeWindow: 60000,
      };

      expect(validConfig.delay).toBe(1000);
      expect(validConfig.maxAttempts).toBe(3);
      expect(validConfig.timeWindow).toBe(60000);
    });
  });
});
