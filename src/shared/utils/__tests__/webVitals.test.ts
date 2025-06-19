import { jest } from '@jest/globals';

/*
  Web-Vitals API functions will be mocked to synchronously invoke the callback they
  receive with a synthetic Metric object. This lets us verify that our helpers
  record the values correctly and that log output is produced as expected.
*/

const createMetric = (name: string, value: number, delta?: number) => ({
  name,
  value,
  delta,
  rating: 'good',
});

const mockOn = (metric: ReturnType<typeof createMetric>) =>
  jest.fn((cb: (m: ReturnType<typeof createMetric>) => void) => cb(metric));

// Helper to mutate window.location.hostname (read-only by default)
const setHostname = (host: string) => {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, hostname: host },
    writable: true,
    configurable: true,
  });
};

// Because the module under test captures the mocks on import time, we need to
// recreate the mocked environment for each test via jest.isolateModules.

describe('webVitals utilities', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('generateWebVitalsReport should collect all metrics', () => {
    const metrics = {
      CLS: createMetric('CLS', 0.11, 0.11),
      INP: createMetric('INP', 210, 10),
      LCP: createMetric('LCP', 1.5, 0.1),
      FCP: createMetric('FCP', 1.2, 0), // delta 0 to hit no-delta branch
      TTFB: createMetric('TTFB', 120, 5),
    } as const;

    jest.doMock('web-vitals', () => ({
      onCLS: mockOn(metrics.CLS),
      onINP: mockOn(metrics.INP),
      onFCP: mockOn(metrics.FCP),
      onLCP: mockOn(metrics.LCP),
      onTTFB: mockOn(metrics.TTFB),
      type: () => {},
    }));

    setHostname('localhost');

    jest.isolateModules(() => {
      const { generateWebVitalsReport } = require('../webVitals');
      const report = generateWebVitalsReport();

      expect(report).toMatchObject({
        CLS: metrics.CLS.value,
        INP: metrics.INP.value,
        LCP: metrics.LCP.value,
        FCP: metrics.FCP.value,
        TTFB: metrics.TTFB.value,
      });
      expect(typeof report.timestamp).toBe('string');
    });
  });

  it('logWebVitalsReport should output logs only in development', () => {
    const metric = createMetric('CLS', 0.2, 0.2);

    const onCLSSpy = mockOn(metric);

    jest.doMock('web-vitals', () => ({
      onCLS: onCLSSpy,
      onINP: jest.fn(),
      onFCP: jest.fn(),
      onLCP: jest.fn(),
      onTTFB: jest.fn(),
    }));

    // Development environment (localhost)
    setHostname('localhost');
    jest.isolateModules(() => {
      const { logWebVitalsReport } = require('../webVitals');
      logWebVitalsReport();
      expect(onCLSSpy).toHaveBeenCalled();
    });

    // Production environment – should exit early (no extra call)
    setHostname('example.com');
    jest.isolateModules(() => {
      const { logWebVitalsReport } = require('../webVitals');
      logWebVitalsReport();
      expect(onCLSSpy).toHaveBeenCalledTimes(1);
    });
  });
});
