import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

import { ToastOptions } from '@domain/types/toast';

type ToastContextType = {
  show: (options: ToastOptions) => void;
  success: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
  error: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
  warning: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
  info: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;
const MAX_TOASTS = 3; // Máximo de toasts simultáneos

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: number }>>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(toasts => toasts.filter(t => t.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    setToasts(toasts => {
      const next = [
        ...toasts,
        {
          ...options,
          id: ++toastId,
          duration: options.duration ?? 5000,
          autohide: options.autohide !== undefined ? options.autohide : true,
        },
      ];
      // Limit the number of active toasts
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      show({ message, title, type: 'Success', ...options }),
    [show]
  );
  const error = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      show({ message, title, type: 'Danger', ...options }),
    [show]
  );
  const warning = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      show({ message, title, type: 'Warning', ...options }),
    [show]
  );
  const info = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      show({ message, title, type: 'Info', ...options }),
    [show]
  );

  const toastApi = useMemo(
    () => ({
      show,
      success,
      error,
      warning,
      info,
    }),
    [show, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map(({ id, title, message, type, duration, autohide }) => (
          <Toast
            key={id}
            bg={type?.toLowerCase()}
            onClose={() => removeToast(id)}
            delay={duration}
            autohide={autohide}>
            {title && (
              <Toast.Header>
                <strong className="me-auto">{title}</strong>
                <small>{new Date().toLocaleTimeString()}</small>
              </Toast.Header>
            )}
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within a ToastProvider');
  return ctx;
}
