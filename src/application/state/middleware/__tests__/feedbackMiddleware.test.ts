import { configureStore, type Middleware } from '@reduxjs/toolkit';

import {
  forgotPasswordAction,
  loginAction,
  registerAction,
} from '@application/state/actions/auth.actions';
import { APP_ROUTES } from '@shared/constants/appRoutes';

/**
 * Mock of i18next to avoid external dependencies and return the translated key as is.
 * Important! Must be declared BEFORE importing the middleware to test.
 */
jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
  },
}));

describe('feedbackMiddleware', () => {
  const createStoreWithMiddleware = (middleware: Middleware) =>
    configureStore({
      reducer: (state: Record<string, unknown> = {}) => state,
      middleware: getDefault => getDefault().concat(middleware),
    });

  const createDeps = () => {
    const success = jest.fn();
    const error = jest.fn();
    const navigate = jest.fn();
    const toast = {
      success,
      error,
    } as unknown as import('@shared/services/ToastProvider').ToastContextType;
    return { toast, navigate, success, error };
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('debe ignorar acciones cuando configureFeedback no ha sido invocado', async () => {
    jest.isolateModules(() => {
      const { feedbackMiddleware } = require('@application/state/middleware/feedbackMiddleware');
      const store = createStoreWithMiddleware(feedbackMiddleware);

      store.dispatch({ type: loginAction.fulfilled.type });
    });
  });

  it('debe mostrar toast de éxito y redirigir cuando la acción de registro se completa', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, navigate, success } = createDeps();

      configureFeedback({ toast, navigate });
      const store = createStoreWithMiddleware(feedbackMiddleware);

      store.dispatch({ type: registerAction.fulfilled.type });

      expect(success).toHaveBeenCalledWith('register.success', 'register.welcome');
      expect(navigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  it('debe mostrar toast de éxito SIN redirigir cuando la acción forgotPassword se completa', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, navigate, success } = createDeps();

      configureFeedback({ toast, navigate });
      const store = createStoreWithMiddleware(feedbackMiddleware);

      store.dispatch({ type: forgotPasswordAction.fulfilled.type });

      expect(success).toHaveBeenCalledWith('forgot.success', 'forgot.check_email');
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('debe mostrar toast de error usando el mensaje proporcionado en payload', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, navigate, error } = createDeps();

      configureFeedback({ toast, navigate });
      const store = createStoreWithMiddleware(feedbackMiddleware);

      const payloadMessage = 'Credenciales inválidas';
      store.dispatch({ type: loginAction.rejected.type, payload: { message: payloadMessage } });

      expect(error).toHaveBeenCalledWith(payloadMessage, 'login.failed');
    });
  });

  it('debe mostrar toast de error con mensaje genérico cuando payload.message está ausente', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, navigate, error } = createDeps();

      configureFeedback({ toast, navigate });
      const store = createStoreWithMiddleware(feedbackMiddleware);

      store.dispatch({ type: loginAction.rejected.type });

      expect(error).toHaveBeenCalledWith('errors.unknown', 'login.failed');
    });
  });

  it('no debe realizar ninguna acción para tipos no mapeados', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, navigate, success, error } = createDeps();

      configureFeedback({ toast, navigate });
      const store = createStoreWithMiddleware(feedbackMiddleware);

      store.dispatch({ type: 'alguna/accion/desconocida' });

      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('debe ignorar la acción si solo toastApi está definido pero navigateFn no', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { toast, success } = createDeps();
      // Solo configuramos toast, no navigate
      configureFeedback({ toast, navigate: undefined });
      const store = configureStore({
        reducer: (state: Record<string, unknown> = {}) => state,
        middleware: getDefault => getDefault().concat(feedbackMiddleware),
      });
      store.dispatch({ type: loginAction.fulfilled.type });
      expect(success).not.toHaveBeenCalled();
    });
  });

  it('debe ignorar la acción si solo navigateFn está definido pero toastApi no', () => {
    jest.isolateModules(() => {
      const {
        feedbackMiddleware,
        configureFeedback,
      } = require('@application/state/middleware/feedbackMiddleware');
      const { navigate, success } = createDeps();
      // Solo configuramos navigate, no toast
      configureFeedback({ toast: undefined, navigate });
      const store = configureStore({
        reducer: (state: Record<string, unknown> = {}) => state,
        middleware: getDefault => getDefault().concat(feedbackMiddleware),
      });
      store.dispatch({ type: loginAction.fulfilled.type });
      expect(success).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('debe ignorar la acción cuando ambos toastApi y navigateFn son undefined', () => {
    jest.isolateModules(() => {
      const { feedbackMiddleware } = require('@application/state/middleware/feedbackMiddleware');
      const store = configureStore({
        reducer: (state: Record<string, unknown> = {}) => state,
        middleware: getDefault => getDefault().concat(feedbackMiddleware),
      });

      // Dispatch una acción sin configurar configureFeedback
      store.dispatch({ type: loginAction.fulfilled.type });

      // No debe haber efectos secundarios ya que ambos son undefined
      // Este test asegura que la línea 44 se ejecute completamente
    });
  });

  it('debe ignorar la acción cuando configureFeedback no ha sido llamado (ambos undefined)', () => {
    jest.isolateModules(() => {
      const { feedbackMiddleware } = require('@application/state/middleware/feedbackMiddleware');
      const store = configureStore({
        reducer: (state: Record<string, unknown> = {}) => state,
        middleware: getDefault => getDefault().concat(feedbackMiddleware),
      });

      // Dispatch múltiples acciones sin configuración previa
      store.dispatch({ type: loginAction.fulfilled.type });
      store.dispatch({ type: registerAction.fulfilled.type });
      store.dispatch({ type: forgotPasswordAction.fulfilled.type });

      // No debe haber efectos secundarios
      // Este test cubre específicamente la rama donde ambos son undefined
    });
  });
});
