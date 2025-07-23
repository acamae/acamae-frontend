import { THROTTLE_CONFIGS, ThrottleConfig, getEnvVar } from '../security';

// --- NUEVOS TESTS PARA getEnvVar ---
describe('getEnvVar helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should return the env variable value if it exists and is valid (not test env)', () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV_VAR = '1234';
    expect(getEnvVar('TEST_ENV_VAR', '42')).toBe(1234);
  });

  it('should return the default value if env variable does not exist (not test env)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.TEST_ENV_VAR;
    expect(getEnvVar('TEST_ENV_VAR', '42')).toBe(42);
  });

  it('should return the default value if env variable is empty string (not test env)', () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV_VAR = '';
    expect(getEnvVar('TEST_ENV_VAR', '42')).toBe(42);
  });

  it('should return the default value if env variable is not a number', () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV_VAR = 'abc';
    expect(getEnvVar('TEST_ENV_VAR', '42')).toBe(42);
  });

  it('should return 0 if both env variable and default are not numbers', () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV_VAR = 'abc';
    expect(getEnvVar('TEST_ENV_VAR', 'notanumber')).toBe(0);
  });

  it('should allow override in test env', () => {
    process.env.NODE_ENV = 'test';
    process.env.TEST_ENV_VAR = '777';
    expect(getEnvVar('TEST_ENV_VAR', '42')).toBe(777);
  });
});

// --- TESTS DE COMPORTAMIENTO ---
describe('Security Constants', () => {
  describe('THROTTLE_CONFIGS', () => {
    it('should have all required configurations defined', () => {
      expect(THROTTLE_CONFIGS.AUTH_FORMS).toBeDefined();
      expect(THROTTLE_CONFIGS.REGULAR_FORMS).toBeDefined();
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS).toBeDefined();
    });

    it('should have valid types for all configuration properties', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        expect(typeof config.delay).toBe('number');
        expect(typeof config.maxAttempts).toBe('number');
        expect(typeof config.timeWindow).toBe('number');
        expect(typeof config.persistInClient).toBe('boolean');
      });
    });

    it('should have positive values for all numeric properties', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        expect(config.delay).toBeGreaterThan(0);
        expect(config.maxAttempts).toBeGreaterThan(0);
        expect(config.timeWindow).toBeGreaterThan(0);
        expect(Number.isFinite(config.delay)).toBe(true);
        expect(Number.isFinite(config.maxAttempts)).toBe(true);
        expect(Number.isFinite(config.timeWindow)).toBe(true);
      });
    });

    it('should have AUTH_FORMS with stricter settings than REGULAR_FORMS', () => {
      // Auth forms should have longer delay and fewer attempts for higher security
      expect(THROTTLE_CONFIGS.AUTH_FORMS.delay).toBeGreaterThanOrEqual(
        THROTTLE_CONFIGS.REGULAR_FORMS.delay
      );
      expect(THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts).toBeLessThanOrEqual(
        THROTTLE_CONFIGS.REGULAR_FORMS.maxAttempts
      );
    });

    it('should have CRITICAL_ACTIONS with strictest settings', () => {
      // Critical actions should have the longest delay and fewest attempts
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.delay).toBeGreaterThanOrEqual(
        THROTTLE_CONFIGS.AUTH_FORMS.delay
      );
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.maxAttempts).toBeLessThanOrEqual(
        THROTTLE_CONFIGS.AUTH_FORMS.maxAttempts
      );
    });

    it('should have persistent configurations correctly marked', () => {
      // AUTH_FORMS and CRITICAL_ACTIONS should be persistent for security
      expect(THROTTLE_CONFIGS.AUTH_FORMS.persistInClient).toBe(true);
      expect(THROTTLE_CONFIGS.CRITICAL_ACTIONS.persistInClient).toBe(true);

      // REGULAR_FORMS should not be persistent for better UX
      expect(THROTTLE_CONFIGS.REGULAR_FORMS.persistInClient).toBe(false);
    });

    it('should have reasonable time windows (not too short or too long)', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        // Time window should be at least 1 minute and at most 1 hour
        expect(config.timeWindow).toBeGreaterThanOrEqual(60000); // 1 minute
        expect(config.timeWindow).toBeLessThanOrEqual(3600000); // 1 hour
      });
    });

    it('should have reasonable delays (not too short or too long)', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        // Delay should be at least 1 second and at most 30 seconds
        expect(config.delay).toBeGreaterThanOrEqual(1000); // 1 second
        expect(config.delay).toBeLessThanOrEqual(30000); // 30 seconds
      });
    });

    it('should have reasonable max attempts (not too few or too many)', () => {
      const configKeys = Object.keys(THROTTLE_CONFIGS) as Array<keyof typeof THROTTLE_CONFIGS>;

      configKeys.forEach(key => {
        const config = THROTTLE_CONFIGS[key];
        // Max attempts should be reasonable for user experience
        expect(config.maxAttempts).toBeGreaterThanOrEqual(3); // At least 3 attempts
        expect(config.maxAttempts).toBeLessThanOrEqual(50); // Not more than 50
      });
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

    it('should accept configuration with optional persistInClient', () => {
      const configWithPersist: ThrottleConfig = {
        delay: 2000,
        maxAttempts: 5,
        timeWindow: 120000,
        persistInClient: true,
      };

      expect(configWithPersist.persistInClient).toBe(true);
    });
  });
});
