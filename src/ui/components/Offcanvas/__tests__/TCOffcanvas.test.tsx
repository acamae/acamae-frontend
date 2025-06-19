import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// Mock react-i18next to control language
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: mockLang.current,
    },
  }),
}));

// Helper to mutate language in each test
const mockLang = { current: 'en-GB' };

// Mock react-bootstrap Offcanvas with minimal implementation that keeps the API
jest.mock('react-bootstrap', () => {
  type OffcanvasProps = {
    show?: boolean;
    onHide?: () => void;
    children?: React.ReactNode;
    'data-testid'?: string;
  };

  const Offcanvas = ({ show, onHide, children, 'data-testid': testId }: OffcanvasProps) =>
    show ? (
      <div data-testid={testId ?? 'offcanvas'}>
        <button data-testid="close-btn" onClick={onHide}>
          close
        </button>
        {children}
      </div>
    ) : null;

  const Slot =
    (testId: string) =>
    ({ children }: { children?: React.ReactNode }) => <div data-testid={testId}>{children}</div>;

  Offcanvas.Header = Slot('header');
  Offcanvas.Title = ({ children }: { children?: React.ReactNode }) => (
    <h1 data-testid="title">{children}</h1>
  );
  Offcanvas.Body = Slot('body');
  return { Offcanvas };
});

import TCOffcanvas from '../TCOffcanvas';

const setup = (language: 'en-GB' | 'es-ES', show = true) => {
  mockLang.current = language;
  const onHide = jest.fn();
  render(<TCOffcanvas show={show} onHide={onHide} />);
  return { onHide };
};

describe('TCOffcanvas', () => {
  it('renders English content when language is en-GB', () => {
    setup('en-GB');

    expect(screen.getByTestId('title')).toHaveTextContent('Terms and Conditions');
    // quick check for English body snippet
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
  });

  it('renders Spanish content when language is es-ES', () => {
    setup('es-ES');

    expect(screen.getByTestId('title')).toHaveTextContent('Términos y Condiciones');
    expect(screen.getByText(/¡Bienvenido a/)).toBeInTheDocument();
  });

  it('invokes onHide callback when close button is clicked', () => {
    const { onHide } = setup('en-GB');
    fireEvent.click(screen.getByTestId('close-btn'));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('does not render Offcanvas when show is false', () => {
    setup('en-GB', false);
    expect(screen.queryByTestId('offcanvas')).not.toBeInTheDocument();
  });
});
