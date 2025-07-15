import { Middleware } from '@reduxjs/toolkit';

import { logService } from '@shared/services/logService';
import { toastService } from '@shared/services/toastService';

// Interfaces para tipar las acciones de error
interface ErrorAction {
  error: boolean;
  payload?: {
    message?: string;
  };
}

interface RejectedAction {
  type: string;
  meta?: {
    rejectedWithValue?: boolean;
  };
  payload?: string | { message?: string };
}

/**
 * Middleware para manejar errores en las acciones de Redux.
 * Muestra mensajes de error al usuario y registra los errores.
 */
const errorHandlingMiddleware: Middleware = () => next => action => {
  // Procesar la acción normalmente
  const result = next(action);

  // Manejar acciones de error
  const errorAction = action as ErrorAction;
  if (errorAction.error === true && errorAction.payload) {
    // Extraer el mensaje de error
    const errorMessage = errorAction.payload.message || 'An error occurred';

    // Registrar el error
    logService.error('Error action dispatched:', action);

    // Mostrar mensaje al usuario
    toastService.error(errorMessage);
  }

  // Manejar acciones rechazadas (rejected) de thunks
  const rejectedAction = action as RejectedAction;
  if (
    rejectedAction.type?.endsWith('/rejected') &&
    rejectedAction.meta?.rejectedWithValue &&
    rejectedAction.payload
  ) {
    // Extraer el mensaje de error del payload
    let errorMessage: string;
    if (
      typeof rejectedAction.payload === 'object' &&
      rejectedAction.payload &&
      'message' in rejectedAction.payload
    ) {
      errorMessage = (rejectedAction.payload as { message?: string }).message || 'Operation failed';
    } else if (typeof rejectedAction.payload === 'string') {
      errorMessage = rejectedAction.payload;
    } else {
      errorMessage = 'Operation failed';
    }

    // Registrar el error
    logService.error('Rejected action:', action);

    // Mostrar mensaje al usuario
    toastService.error(errorMessage);
  }

  return result;
};

export default errorHandlingMiddleware;
