import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import FeedbackInitializer from '@ui/components/FeedbackInitializer';

// Mocks necesarios
jest.mock('@ui/hooks/useToast', () => ({
  useToast: jest.fn().mockReturnValue({
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    show: jest.fn(),
  }),
}));

jest.mock('@application/state/middleware/feedbackMiddleware', () => ({
  configureFeedback: jest.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('FeedbackInitializer', () => {
  it('debe renderizar sus hijos sin afectar la estructura del DOM', () => {
    const { container } = renderWithRouter(
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

    renderWithRouter(
      <FeedbackInitializer>
        <div>Test Child</div>
      </FeedbackInitializer>
    );

    // Verificar que el método configureFeedback se llamó una vez
    expect(mockConfigureFeedback).toHaveBeenCalledTimes(1);
  });
});
