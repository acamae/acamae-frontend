import { configureStore } from '@reduxjs/toolkit';

import sessionTimerMiddleware from '@application/state/middleware/sessionTimerMiddleware';
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
    match: (action: unknown) =>
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      action.type === 'auth/logout/fulfilled',
  } as unknown;

  const loginAction = () => ({ type: 'auth/login/fulfilled' });
  loginAction.fulfilled = {
    match: (action: unknown) =>
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      action.type === 'auth/login/fulfilled',
  } as unknown;
  return { logoutAction, loginAction };
});

// Stub auth reducer to control authentication state in each test
const createAuthReducer = (isAuthenticated: boolean) => () => ({ isAuthenticated });

const createTestStore = (isAuthenticated = true) =>
  configureStore({
    reducer: {
      sessionTimer: sessionTimerReducer,
      auth: createAuthReducer(isAuthenticated),
    },
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

  it('should dispatch resetTimer => setExpiresAt with future timestamp when authenticated', () => {
    const store = createTestStore(true);
    store.dispatch(resetTimer());

    const actions = store.getState().sessionTimer;
    expect(actions.expiresAt).toBeGreaterThan(0);
  });

  it('should ignore resetTimer when user is not authenticated', () => {
    const store = createTestStore(false);
    const { setExpiresAt } =
      require('@infrastructure/storage/sessionExpiryService').sessionExpiryService;

    store.dispatch(resetTimer());

    // No efecto en almacenamiento ni programación de temporizador
    expect(setExpiresAt).not.toHaveBeenCalled();
    expect(store.getState().sessionTimer.showModal).toBe(false);
  });

  it('should program interval and show modal / logout when receiving setExpiresAt', () => {
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

  it('should cancel timer and clear storage when receiving removeExpiresAt', () => {
    const store = createTestStore();
    store.dispatch(removeExpiresAt());
    expect(sessionExpiryService.removeExpiresAt).toHaveBeenCalled();
  });

  it('should not show modal if it is already visible when the warning time is reached', () => {
    const store = createTestStore();

    // 1 minute session and warning at 30 seconds
    const expiresAt = Date.now() + 60_000;
    store.dispatch(setExpiresAt(expiresAt));

    // Show the modal manually
    store.dispatch(showModal());
    expect(store.getState().sessionTimer.showModal).toBe(true);

    // Advance to the warning point (30 seconds before expiration)
    jest.advanceTimersByTime(30_000);
    jest.setSystemTime(30_000);

    // The modal should remain visible but its state should not have changed
    expect(store.getState().sessionTimer.showModal).toBe(true);
  });

  it('should handle null or undefined expiresAt value', () => {
    const store = createTestStore();

    // Set expiresAt to 0 (which is equivalent to null/undefined in this context)
    store.dispatch(setExpiresAt(0));

    // Advance time to trigger the interval
    jest.advanceTimersByTime(1000);

    // Verify that secondsLeft is 0 and no modal is shown
    expect(store.getState().sessionTimer.showModal).toBe(false);
    expect(store.getState().sessionTimer.expiresAt).toBe(0);
  });

  it('should start timer after successful login', () => {
    const store = createTestStore(true);
    const { setExpiresAt } =
      require('@infrastructure/storage/sessionExpiryService').sessionExpiryService;

    // Dispatch mocked login fulfilled action
    store.dispatch({ type: 'auth/login/fulfilled' });

    expect(setExpiresAt).toHaveBeenCalled();
  });
});
