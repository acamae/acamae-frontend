import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ToastProvider } from '@shared/services/ToastProvider';
import FeedbackInitializer from '@ui/components/FeedbackInitializer';

// Mocks necesarios
jest.mock('@shared/services/ToastProvider', () => ({
  ...jest.requireActual('@shared/services/ToastProvider'),
  useToastContext: jest.fn(),
}));

jest.mock('@application/state/middleware/feedbackMiddleware', () => ({
  configureFeedback: jest.fn(),
}));

const mockUseToastContext = require('@shared/services/ToastProvider').useToastContext;

const renderWithProviders = (component: React.ReactElement) => {
  const mockToastContext = {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    show: jest.fn(),
  };

  mockUseToastContext.mockReturnValue(mockToastContext);

  return render(
    <MemoryRouter>
      <ToastProvider>{component}</ToastProvider>
    </MemoryRouter>
  );
};

describe('FeedbackInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar sus hijos sin afectar la estructura del DOM', () => {
    const { container } = renderWithProviders(
      <FeedbackInitializer>
        <div data-testid="test-child">Test Child</div>
      </FeedbackInitializer>
    );

    // Verificar que el componente hijo se renderiza correctamente
    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
    expect(container.textContent).toBe('Test Child');
  });

  it('debe llamar a configureFeedback durante el montaje', () => {
    const mockConfigureFeedback = jest.fn();
    const { configureFeedback } = require('@application/state/middleware/feedbackMiddleware');
    configureFeedback.mockImplementation(mockConfigureFeedback);

    renderWithProviders(
      <FeedbackInitializer>
        <div>Test Child</div>
      </FeedbackInitializer>
    );

    // Verificar que el método configureFeedback se llamó una vez
    expect(mockConfigureFeedback).toHaveBeenCalledTimes(1);
  });
});
