import { configureStore } from '@reduxjs/toolkit';

import errorHandlingMiddleware from '@application/state/middleware/errorHandlingMiddleware';

// Mock para el servicio toast
jest.mock('@shared/services/toastService', () => ({
  toastService: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    show: jest.fn(),
  },
}));

// Mock para el servicio de logs
jest.mock('@shared/services/logService', () => ({
  logService: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
  },
}));

describe('errorHandlingMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe pasar acciones sin errores sin modificarlas', () => {
    const { toastService } = require('@shared/services/toastService');
    const { logService } = require('@shared/services/logService');

    const store = configureStore({
      reducer: state => state || {},
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(errorHandlingMiddleware),
    });

    const regularAction = { type: 'test/action' };
    store.dispatch(regularAction);

    expect(toastService.error).not.toHaveBeenCalled();
    expect(logService.error).not.toHaveBeenCalled();
  });

  it('debe manejar acciones de error y mostrar mensaje de toast', () => {
    const { toastService } = require('@shared/services/toastService');
    const { logService } = require('@shared/services/logService');

    const store = configureStore({
      reducer: state => state || {},
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(errorHandlingMiddleware),
    });

    const errorAction = {
      type: 'test/error',
      error: true,
      payload: new Error('Test error message'),
    };

    store.dispatch(errorAction);

    expect(toastService.error).toHaveBeenCalledWith('Test error message');
    expect(logService.error).toHaveBeenCalledWith('Error action dispatched:', expect.any(Object));
  });

  it('debe manejar acciones rechazadas (rejected) de forma adecuada', () => {
    const { toastService } = require('@shared/services/toastService');
    const { logService } = require('@shared/services/logService');

    const store = configureStore({
      reducer: state => state || {},
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(errorHandlingMiddleware),
    });

    const rejectedAction = {
      type: 'test/rejected',
      payload: { message: 'API error message' },
      meta: {
        rejectedWithValue: true,
      },
    };

    store.dispatch(rejectedAction);

    expect(toastService.error).toHaveBeenCalledWith('API error message');
    expect(logService.error).toHaveBeenCalledWith(
      'Rejected action:',
      expect.objectContaining({ type: 'test/rejected' })
    );
  });

  it('debe manejar errores sin mensaje de forma segura', () => {
    const { toastService } = require('@shared/services/toastService');
    const { logService } = require('@shared/services/logService');

    const store = configureStore({
      reducer: state => state || {},
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(errorHandlingMiddleware),
    });

    const errorActionNoMessage = {
      type: 'test/error',
      error: true,
      payload: new Error(),
    };

    store.dispatch(errorActionNoMessage);

    expect(toastService.error).toHaveBeenCalledWith('An error occurred');
    expect(logService.error).toHaveBeenCalled();
  });
});
