import { configureStore } from '@reduxjs/toolkit';

import sessionTimerMiddleware from '@application/state/sessionTimerMiddleware';
import sessionTimerReducer, {
  resetTimer,
  setExpiresAt,
  removeExpiresAt,
  showModal,
} from '@application/state/slices/sessionTimerSlice';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

jest.mock('@infrastructure/storage/sessionExpiryService', () => ({
  sessionExpiryService: {
    setExpiresAt: jest.fn(),
    removeExpiresAt: jest.fn(),
  },
}));

jest.mock('@application/state/actions/auth.actions', () => {
  const logoutAction = () => ({ type: 'auth/logout/fulfilled' });
  logoutAction.fulfilled = {
    match: (action: unknown) => action.type === 'auth/logout/fulfilled',
  } as unknown;
  return { logoutAction };
});

const createTestStore = () =>
  configureStore({
    reducer: { sessionTimer: sessionTimerReducer },
    middleware: getDefault => getDefault().concat(sessionTimerMiddleware),
  });

describe('sessionTimerMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('dispatch resetTimer => setExpiresAt con timestamp futuro', () => {
    const store = createTestStore();
    store.dispatch(resetTimer());

    const actions = store.getState().sessionTimer;
    expect(actions.expiresAt).toBeGreaterThan(0);
  });

  it('al recibir setExpiresAt programa interval y muestra modal / logout', () => {
    const store = createTestStore();

    // 1 minute session and warning at 30 seconds
    const expiresAt = Date.now() + 60_000;
    store.dispatch(setExpiresAt(expiresAt));

    // Advance time to warning point (30 seconds before expiration)
    jest.advanceTimersByTime(30_000);
    jest.setSystemTime(30_000);
    expect(store.getState().sessionTimer.showModal).toBe(true);

    // Advance time to total expiration (other 30 seconds)
    jest.advanceTimersByTime(30_000);
    jest.setSystemTime(60_000);

    // The modal is hidden and logout is triggered
    expect(store.getState().sessionTimer.showModal).toBe(false);
    expect(store.getState().sessionTimer.expiresAt).toBe(0);
  });

  it('removeExpiresAt cancela temporizador y limpia storage', () => {
    const store = createTestStore();
    store.dispatch(removeExpiresAt());
    expect(sessionExpiryService.removeExpiresAt).toHaveBeenCalled();
  });

  it('no muestra el modal si ya está visible cuando se alcanza el tiempo de advertencia', () => {
    const store = createTestStore();

    // 1 minute session and warning at 30 seconds
    const expiresAt = Date.now() + 60_000;
    store.dispatch(setExpiresAt(expiresAt));

    // Mostrar el modal manualmente
    store.dispatch(showModal());
    expect(store.getState().sessionTimer.showModal).toBe(true);

    // Avanzar al punto de advertencia (30 segundos antes de la expiración)
    jest.advanceTimersByTime(30_000);
    jest.setSystemTime(30_000);

    // El modal debe seguir visible pero no debe haber cambiado su estado
    expect(store.getState().sessionTimer.showModal).toBe(true);
  });
});
