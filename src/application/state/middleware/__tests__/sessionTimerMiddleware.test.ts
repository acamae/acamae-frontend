import { configureStore, type Store } from '@reduxjs/toolkit';

import sessionTimerMiddleware from '@application/state/middleware/sessionTimerMiddleware';
import sessionTimerReducer, {
  resetTimer,
  setExpiresAt,
  removeExpiresAt,
  showModal,
} from '@application/state/slices/sessionTimerSlice';

// Constantes para valores reutilizables
const SESSION_TIMEOUT_MINUTES = 15;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
const SESSION_TIMEOUT_WARNING_SECONDS = 30;
const MOCK_ACTION_TYPES = {
  LOGIN_FULFILLED: 'auth/login/fulfilled',
  LOGOUT_FULFILLED: 'auth/logout/fulfilled',
};

// Tipado mejorado para acciones
interface ActionWithType {
  type: string;
  payload?: unknown;
}

// Interfaz para el mock de logoutAction con la propiedad fulfilled
interface MockLogoutThunk extends jest.Mock {
  fulfilled: {
    match: (action: ActionWithType) => boolean;
  };
}

// Configuración de mocks
jest.mock('@infrastructure/storage/sessionExpiryService', () => ({
  sessionExpiryService: {
    setExpiresAt: jest.fn(),
    removeExpiresAt: jest.fn(),
  },
}));

// Para evitar problemas de hoisting y referencia, definimos un factory de matchers
// fuera del mock y utilizamos una función simple dentro del mock
jest.mock('@application/state/actions/auth.actions', () => {
  const mockLogoutThunk = jest.fn(() => (dispatch: (action: ActionWithType) => void) => {
    const action = { type: 'auth/logout/fulfilled' };
    dispatch(action);
    return action;
  });

  // Usamos una implementación directa en lugar de llamar a createActionMatcher
  (mockLogoutThunk as MockLogoutThunk).fulfilled = {
    match: (action: ActionWithType): boolean => action?.type === 'auth/logout/fulfilled',
  };

  return {
    logoutAction: mockLogoutThunk,
    loginAction: {
      fulfilled: {
        match: (action: ActionWithType): boolean => action?.type === 'auth/login/fulfilled',
      },
    },
    __esModule: true,
    mockLogoutThunk,
  };
});

// Factory para el store de pruebas con tipado seguro
interface TestState {
  sessionTimer: {
    expiresAt: number;
    showModal: boolean;
  };
  auth: {
    isAuthenticated: boolean;
  };
}

type TestStore = Store<TestState>;

function createTestStore(isAuthenticated = true): TestStore {
  return configureStore({
    reducer: {
      sessionTimer: sessionTimerReducer,
      auth: () => ({ isAuthenticated }),
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
        thunk: { extraArgument: {} },
      }).concat(sessionTimerMiddleware),
    devTools: false,
  });
}

// Utilitario para obtener los mocks de forma segura
function getMocks() {
  const { mockLogoutThunk } = require('@application/state/actions/auth.actions');
  const { sessionExpiryService } = require('@infrastructure/storage/sessionExpiryService');

  return {
    mockLogoutThunk,
    sessionExpiryService,
  };
}

describe('sessionTimerMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(0);

    // Usar el utilitario para obtener y limpiar los mocks
    const { mockLogoutThunk, sessionExpiryService } = getMocks();
    mockLogoutThunk.mockClear();
    sessionExpiryService.setExpiresAt.mockClear();
    sessionExpiryService.removeExpiresAt.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Casos de prueba para resetTimer
  describe('when handling resetTimer action', () => {
    it('should set future expiresAt timestamp when user is authenticated', () => {
      // Arrange
      const store = createTestStore(true);

      // Act
      store.dispatch(resetTimer());

      // Assert
      const state = store.getState().sessionTimer;
      expect(state.expiresAt).toBe(SESSION_TIMEOUT_MS); // Valor específico en vez de solo "mayor que 0"
      expect(state.showModal).toBe(false);
    });

    it('should not update expiresAt in storage when user is not authenticated', () => {
      // Arrange
      const store = createTestStore(false);
      const { sessionExpiryService } = getMocks();

      // Act
      store.dispatch(resetTimer());

      // Assert
      expect(sessionExpiryService.setExpiresAt).not.toHaveBeenCalled();
      expect(store.getState().sessionTimer.showModal).toBe(false);
      expect(store.getState().sessionTimer.expiresAt).toBe(SESSION_TIMEOUT_MS);
    });
  });

  // Casos de prueba para setExpiresAt
  describe('when handling setExpiresAt action', () => {
    it('should store expiresAt in session storage when authenticated', () => {
      // Arrange
      const store = createTestStore(true);
      const { sessionExpiryService } = getMocks();
      const expiresAt = Date.now() + 60_000;

      // Act
      store.dispatch(setExpiresAt(expiresAt));

      // Assert
      expect(sessionExpiryService.setExpiresAt).toHaveBeenCalledWith(expiresAt);
      expect(store.getState().sessionTimer.expiresAt).toBe(expiresAt);
    });

    it('should not store expiresAt when payload is invalid', () => {
      // Arrange
      const store = createTestStore(true);
      const { sessionExpiryService } = getMocks();

      // Act
      store.dispatch(setExpiresAt(0));

      // Assert
      expect(sessionExpiryService.setExpiresAt).not.toHaveBeenCalled();
      expect(store.getState().sessionTimer.expiresAt).toBe(0);
    });

    it('should not store expiresAt when user is not authenticated', () => {
      // Arrange
      const store = createTestStore(false);
      const { sessionExpiryService } = getMocks();
      const expiresAt = Date.now() + 60_000;

      // Act
      store.dispatch(setExpiresAt(expiresAt));

      // Assert
      expect(sessionExpiryService.setExpiresAt).not.toHaveBeenCalled();
    });

    it('should show modal when warning time is reached', () => {
      // Arrange
      const store = createTestStore(true);
      const warningTimeMs = SESSION_TIMEOUT_WARNING_SECONDS * 1000;
      const expiresAt = Date.now() + warningTimeMs + 1000; // 1 segundo más del tiempo de advertencia
      store.dispatch(setExpiresAt(expiresAt));

      // Act - simular que ha pasado el tiempo hasta la advertencia
      jest.advanceTimersByTime(1000);
      jest.setSystemTime(1000);
      jest.runOnlyPendingTimers();

      // Assert
      expect(store.getState().sessionTimer.showModal).toBe(true);
    });

    it('should not show modal if it is already visible', () => {
      // Arrange
      const store = createTestStore(true);
      const warningTimeMs = SESSION_TIMEOUT_WARNING_SECONDS * 1000;
      const expiresAt = Date.now() + warningTimeMs + 1000;
      store.dispatch(setExpiresAt(expiresAt));
      store.dispatch(showModal());

      // Act - espiamos dispatch para ver si se llama de nuevo
      const spyDispatch = jest.spyOn(store, 'dispatch');
      jest.advanceTimersByTime(1000);
      jest.setSystemTime(1000);
      jest.runOnlyPendingTimers();

      // Assert - confirmamos que showModal no fue llamado de nuevo
      expect(spyDispatch).not.toHaveBeenCalledWith(showModal());
      spyDispatch.mockRestore();
    });
  });

  // Casos de prueba para removeExpiresAt
  describe('when handling removeExpiresAt action', () => {
    it('should clear session storage', () => {
      // Arrange
      const store = createTestStore();
      const { sessionExpiryService } = getMocks();

      // Act
      store.dispatch(removeExpiresAt());

      // Assert
      expect(sessionExpiryService.removeExpiresAt).toHaveBeenCalled();
      expect(store.getState().sessionTimer.expiresAt).toBe(0);
      expect(store.getState().sessionTimer.showModal).toBe(false);
    });
  });

  // Casos de prueba para logoutAction.fulfilled
  describe('when handling logoutAction.fulfilled', () => {
    it('should remove expiresAt and hide modal', () => {
      // Arrange
      const store = createTestStore();
      store.dispatch(showModal());
      expect(store.getState().sessionTimer.showModal).toBe(true);

      // Act
      store.dispatch({ type: MOCK_ACTION_TYPES.LOGOUT_FULFILLED });

      // Assert
      expect(store.getState().sessionTimer.showModal).toBe(false);
      expect(store.getState().sessionTimer.expiresAt).toBe(0);
    });
  });

  // Casos de prueba para loginAction.fulfilled
  describe('when handling loginAction.fulfilled', () => {
    it('should reset timer', () => {
      // Arrange
      const store = createTestStore(true);

      // Act
      store.dispatch({ type: MOCK_ACTION_TYPES.LOGIN_FULFILLED });

      // Assert
      expect(store.getState().sessionTimer.expiresAt).toBe(SESSION_TIMEOUT_MS);
      expect(store.getState().sessionTimer.showModal).toBe(false);
    });
  });
});
