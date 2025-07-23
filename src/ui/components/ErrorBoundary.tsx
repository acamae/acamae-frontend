import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props & { t: (key: string) => string }, State> {
  constructor(props: Props & { t: (key: string) => string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    if (process.env.NODE_ENV !== 'test') {
      console.log('ErrorBoundary: getDerivedStateFromError called with:', error);
    }
    return { hasError: true, error };
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'test') {
      console.log('ErrorBoundary: Component mounted');
    }
    // Capturar errores de JavaScript runtime
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.setState({ error, errorInfo });
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  handleGlobalError = (event: ErrorEvent) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('ErrorBoundary: Global error caught:', event.error);
    }
    this.setState({
      hasError: true,
      error: event.error || new Error(event.message || 'Unknown error'),
    });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('ErrorBoundary: Unhandled rejection caught:', event.reason);
    }
    this.setState({
      hasError: true,
      error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    });
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" data-testid="error-boundary">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <i className="fa-solid fa-exclamation-triangle text-warning h1"></i>
                    </div>
                    <h2 className="h4 mb-3">{t('error.boundary.title')}</h2>
                    <p className="text-muted mb-4">{t('error.boundary.message')}</p>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                        data-testid="error-boundary-reload">
                        <i className="fa-solid fa-rotate me-2"></i>
                        {t('error.boundary.reload')}
                      </button>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => window.history.back()}
                        data-testid="error-boundary-back">
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        {t('error.boundary.back')}
                      </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <details className="mt-4">
                        <summary className="text-muted cursor-pointer">
                          {t('error.boundary.details')}
                        </summary>
                        <div className="mt-2 p-3 bg-light rounded">
                          <pre className="text-danger small mb-2">
                            {this.state.error.toString()}
                          </pre>
                          {this.state.errorInfo && (
                            <pre className="text-muted small">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}

// Wrapper component to provide translation context
const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { t } = useTranslation();
  return (
    <ErrorBoundaryClass t={t} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
