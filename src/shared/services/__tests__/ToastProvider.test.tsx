import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import React from 'react';

import { ToastProvider, useToastContext } from '../ToastProvider';

interface MockToastProps {
  children: React.ReactNode;
  bg?: string;
  onClose?: () => void;
}

interface MockToastComponent extends React.FC<MockToastProps> {
  Header: React.FC<{ children: React.ReactNode }>;
  Body: React.FC<{ children: React.ReactNode }>;
}

jest.mock('react-bootstrap', () => {
  const MockToast: MockToastComponent = ({ children, bg, onClose }) => (
    <div data-testid={`toast-${bg || 'primary'}`} onClick={onClose}>
      {children}
    </div>
  );
  MockToast.Header = ({ children }) => <div>{children}</div>;
  MockToast.Body = ({ children }) => <div>{children}</div>;

  return {
    ToastContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="toast-container">{children}</div>
    ),
    Toast: MockToast,
  };
});

// Helper componente para disparar toasts usando el contexto
const Demo: React.FC = () => {
  const toast = useToastContext();
  return (
    <>
      <button onClick={() => toast.show({ message: 'generic', type: 'Primary' })}>generic</button>
      <button onClick={() => toast.success('ok')}>success</button>
      <button onClick={() => toast.error('fail')}>error</button>
      <button onClick={() => toast.warning('warning')}>warning</button>
      <button onClick={() => toast.info('info')}>info</button>
    </>
  );
};

// Componente para probar toasts con título y mensaje
const ToastWithTitle: React.FC = () => {
  const toast = useToastContext();
  return (
    <button
      onClick={() => toast.show({ message: 'Test message', title: 'Test title', type: 'Primary' })}>
      Show Toast with Title
    </button>
  );
};

const renderWithProvider = (children: React.ReactNode) =>
  render(<ToastProvider>{children}</ToastProvider>);

describe('ToastProvider', () => {
  it('should show a generic toast', async () => {
    renderWithProvider(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText('generic'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('toast-primary')).toBeInTheDocument();
    });
  });

  it('should limit to a maximum of 3 simultaneous toasts', async () => {
    renderWithProvider(<Demo />);

    // Mostrar 4 toasts genéricos
    await act(async () => {
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('generic'));
      }
    });

    // Esperar a que el estado se actualice y verificar que solo hay 3 toasts
    await waitFor(() => {
      const toasts = screen.getAllByTestId('toast-primary');
      expect(toasts.length).toBe(3);
    });
  });

  it('should apply the correct bg to success and error helpers', async () => {
    renderWithProvider(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText('success'));
      fireEvent.click(screen.getByText('error'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-danger')).toBeInTheDocument();
    });
  });

  it('should remove a toast when clicking close', async () => {
    renderWithProvider(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText('success'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toast-success'));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    });
  });

  it('should show toasts with all available types respecting the limit', async () => {
    renderWithProvider(<Demo />);

    // Mostrar los primeros 3 toasts
    await act(async () => {
      fireEvent.click(screen.getByText('success'));
      fireEvent.click(screen.getByText('error'));
      fireEvent.click(screen.getByText('warning'));
    });

    // Verificar que los 3 toasts están presentes
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-danger')).toBeInTheDocument();
      expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    });

    // Mostrar un cuarto toast
    await act(async () => {
      fireEvent.click(screen.getByText('info'));
    });

    // Verificar que solo hay 3 toasts y que el más antiguo (success) se eliminó
    await waitFor(() => {
      // Primero verificamos que el toast más antiguo se eliminó
      expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();

      // Luego verificamos que los otros 3 toasts están presentes
      expect(screen.getByTestId('toast-danger')).toBeInTheDocument();
      expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
      expect(screen.getByTestId('toast-info')).toBeInTheDocument();

      // Finalmente verificamos el número total de toasts
      const container = screen.getByTestId('toast-container');
      const toasts = container.querySelectorAll('[data-testid^="toast-"]');
      expect(toasts.length).toBe(3);
    });
  });

  it('should show toasts with title and message', async () => {
    renderWithProvider(<ToastWithTitle />);
    await act(async () => {
      fireEvent.click(screen.getByText('Show Toast with Title'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Test title')).toBeInTheDocument();
    });
  });
});
