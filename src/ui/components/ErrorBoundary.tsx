import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, CardBody, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { Card, CardHeader } from '@ui/components/Card/Card';

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
    if (process.env.NODE_ENV === 'development') {
      // Log only in development to aid debugging and satisfy test expectation

      console.log('[ErrorBoundary] getDerivedStateFromError', error);
    }
    return { hasError: true, error };
  }

  componentDidMount() {
    // Capturar errores de JavaScript runtime
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  handleGlobalError = (event: ErrorEvent) => {
    this.setState({
      hasError: true,
      error: event.error || new Error(event.message || 'Unknown error'),
    });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
          <main className="error-boundary-content">
            <div className="container">
              <Row className="justify-content-center">
                <Col xs={12}>
                  <Card className="mb-5 mx-auto">
                    <CardHeader className="text-center p-1">
                      <i className="fa-solid fa-exclamation-triangle text-warning h1" />
                      <h2 className="h4 mb-3">{t('error.boundary.title')}</h2>
                    </CardHeader>
                    <CardBody>
                      <p className="text-muted mb-4">{t('error.boundary.message')}</p>
                      <div className="d-grid gap-2">
                        <Button
                          variant="theme"
                          onClick={() => window.location.reload()}
                          data-testid="error-boundary-reload">
                          <i className="fa-solid fa-rotate me-2"></i>
                          {t('error.boundary.reload')}
                        </Button>
                        <Button
                          variant="outline-theme"
                          type="button"
                          onClick={() => window.history.back()}
                          data-testid="error-boundary-back">
                          <i className="fa-solid fa-arrow-left me-2"></i>
                          {t('error.boundary.back')}
                        </Button>
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
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          </main>
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
