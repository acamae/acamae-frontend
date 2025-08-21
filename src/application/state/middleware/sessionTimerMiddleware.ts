import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';

import { logoutAction, loginAction } from '@application/state/actions/auth.actions';
import {
  setExpiresAt,
  hideModal,
  showModal,
  resetTimer,
  removeExpiresAt,
} from '@application/state/slices/sessionTimerSlice';
import { AppDispatch } from '@domain/types/redux';
import { localStorageService } from '@infrastructure/storage/localStorageService';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

const SESSION_TIMEOUT_MINUTES = Number(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES) || 15;
const SESSION_TIMEOUT_WARNING_SECONDS =
  Number(process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS) || 30;

let timer: NodeJS.Timeout | null = null;

// Funciones auxiliares para reducir complejidad
function isUserAuthenticated(store: MiddlewareAPI): boolean {
  const state = store.getState() as { auth?: { isAuthenticated?: boolean } };
  return Boolean(state.auth?.isAuthenticated);
}

function clearTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function handleSessionInterval(store: MiddlewareAPI): void {
  const { expiresAt, showModal: isModalShown } = store.getState().sessionTimer;
  const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;

  if (secondsLeft === SESSION_TIMEOUT_WARNING_SECONDS && !isModalShown) {
    store.dispatch(showModal());
  }

  if (secondsLeft <= 0) {
    clearTimer();
    store.dispatch(hideModal());
    (store.dispatch as AppDispatch)(logoutAction());
  }
}

function handleResetTimer(store: MiddlewareAPI): void {
  if (!isUserAuthenticated(store)) {
    return;
  }

  const expiresAt = Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000;
  store.dispatch(setExpiresAt(expiresAt));
}

function handleSetExpiresAt(store: MiddlewareAPI, payload: number): void {
  if (!isUserAuthenticated(store) || !payload) {
    return;
  }

  sessionExpiryService.setExpiresAt(payload);
  clearTimer();
  timer = setInterval(() => handleSessionInterval(store), 1000);
}

function handleRemoveExpiresAt(): void {
  clearTimer();
  sessionExpiryService.removeExpiresAt();
}

function handleLogoutFulfilled(store: MiddlewareAPI): void {
  clearTimer();
  store.dispatch(removeExpiresAt());
  // Ensure persisted auth is removed to avoid stale rehydration
  try {
    localStorageService.remove('persist:auth');
    localStorageService.remove('__refreshToken__');
    // Attempt to purge redux-persist storage to fully reset persistence state
    const mod = require('@application/state/store');
    if (mod?.persistor?.purge) {
      mod.persistor.purge();
    }
  } catch {
    // ignore storage errors
  }
}

function handleLoginFulfilled(store: MiddlewareAPI): void {
  store.dispatch(resetTimer());
}

const sessionTimerMiddleware: Middleware = (store: MiddlewareAPI) => next => action => {
  const result = next(action);

  if (resetTimer.match(action)) {
    handleResetTimer(store);
  } else if (setExpiresAt.match(action)) {
    handleSetExpiresAt(store, action.payload);
  } else if (removeExpiresAt.match(action)) {
    handleRemoveExpiresAt();
  } else if (logoutAction.pending?.match && logoutAction.pending.match(action)) {
    // On logout start, cleanup timers and persisted auth to avoid stale auth on rehydrate
    handleLogoutFulfilled(store);
  } else if (logoutAction.fulfilled.match(action)) {
    handleLogoutFulfilled(store);
  } else if (logoutAction.rejected?.match && logoutAction.rejected.match(action)) {
    // Ensure timer cleanup also when logout API fails
    handleLogoutFulfilled(store);
  } else if (loginAction.fulfilled.match(action)) {
    handleLoginFulfilled(store);
  }

  return result;
};

export default sessionTimerMiddleware;
