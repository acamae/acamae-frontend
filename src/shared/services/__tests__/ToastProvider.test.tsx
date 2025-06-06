import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import React from 'react';

import { ToastProvider, useToastContext } from '../ToastProvider';

jest.mock('react-bootstrap', () => {
  const MockToast: unknown = ({ children, bg, onClose }: unknown) => (
    <div data-testid={`toast-${bg || 'primary'}`} onClick={onClose}>
      {children}
    </div>
  );
  MockToast.Header = ({ children }: unknown) => <div>{children}</div>;
  MockToast.Body = ({ children }: unknown) => <div>{children}</div>;

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
  it('muestra un toast genérico', async () => {
    renderWithProvider(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText('generic'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('toast-primary')).toBeInTheDocument();
    });
  });

  it('limita a máximo 3 toasts simultáneos', async () => {
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

  it('helpers success y error aplican bg correcto', async () => {
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

  it('elimina un toast cuando se hace clic en cerrar', async () => {
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

  it('muestra toasts con todos los tipos disponibles respetando el límite', async () => {
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

  it('muestra toasts con título y mensaje', async () => {
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
