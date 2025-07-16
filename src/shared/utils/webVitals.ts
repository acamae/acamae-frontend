import { type Metric, onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsReport {
  CLS: number;
  INP: number;
  LCP: number;
  FCP: number;
  TTFB: number;
  timestamp: string;
}

// Function to determine if we are in development
const isDevelopment = (): boolean => {
  // Check if we are on localhost
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const shouldReportWebVitals = (): boolean => {
  // Always report in development
  if (isDevelopment()) {
    console.log('Web Vitals: Development mode detected, reporting metrics');
    return true;
  }

  // Do not report in production
  console.log('Web Vitals: Metrics will not be reported in production');
  return false;
};

const formatMetricValue = (metric: Metric): string => {
  const value = metric.value.toFixed(2);

  let delta = '';
  if (metric.delta) {
    const sign = metric.delta > 0 ? '+' : '';
    delta = ` (${sign}${metric.delta.toFixed(2)})`;
  }

  return `${value}${delta}`;
};

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export const generateWebVitalsReport = (): WebVitalsReport => {
  const report: WebVitalsReport = {
    CLS: 0,
    INP: 0,
    LCP: 0,
    FCP: 0,
    TTFB: 0,
    timestamp: new Date().toISOString(),
  };

  const handleMetric = (metric: unknown) => {
    if (typeof metric === 'object' && metric !== null && 'name' in metric && 'value' in metric) {
      const m = metric as Metric;
      switch (m.name) {
        case 'CLS':
          report.CLS = m.value;
          break;
        case 'INP':
          report.INP = m.value;
          break;
        case 'LCP':
          report.LCP = m.value;
          break;
        case 'FCP':
          report.FCP = m.value;
          break;
        case 'TTFB':
          report.TTFB = m.value;
          break;
      }
    }
  };

  reportWebVitals(handleMetric);
  return report;
};

export const logWebVitalsReport = () => {
  // Skip execution during tests
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  console.log('Web Vitals: Iniciando reporte de métricas');
  console.log('Web Vitals: Entorno =', isDevelopment() ? 'Desarrollo' : 'Producción');

  if (!shouldReportWebVitals()) return;

  reportWebVitals((report: Metric) => {
    const formattedValue = formatMetricValue(report);
    const environment = isDevelopment() ? '🛠️ Development' : '🚀 Production';

    console.log(
      `%cWeb Vitals [${environment}]%c ${report.name}: ${formattedValue} (${report.rating})`,
      'color: #4CAF50; font-weight: bold;',
      'color: inherit;'
    );
  });
};

export default reportWebVitals;
