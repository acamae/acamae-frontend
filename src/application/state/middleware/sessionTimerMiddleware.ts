import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';

import { logoutAction } from '@application/state/actions/auth.actions';
import {
  setExpiresAt,
  hideModal,
  showModal,
  resetTimer,
  removeExpiresAt,
} from '@application/state/slices/sessionTimerSlice';
import { AppDispatch } from '@domain/types/redux';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

const SESSION_TIMEOUT_MINUTES = Number(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES) || 15;
const SESSION_TIMEOUT_WARNING_SECONDS =
  Number(process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS) || 30;

let timer: NodeJS.Timeout | null = null;

const sessionTimerMiddleware: Middleware = (store: MiddlewareAPI) => next => action => {
  const result = next(action);

  if (resetTimer.match(action)) {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000;
    store.dispatch(setExpiresAt(expiresAt));
  }

  // When the session is renewed (e.g. stay connected)
  if (setExpiresAt.match(action)) {
    sessionExpiryService.setExpiresAt(action.payload);
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      const { expiresAt, showModal: isModalShown } = store.getState().sessionTimer;
      const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;

      if (secondsLeft === SESSION_TIMEOUT_WARNING_SECONDS && !isModalShown) {
        store.dispatch(showModal());
      }

      if (secondsLeft <= 0) {
        clearInterval(timer!);
        store.dispatch(hideModal());
        (store.dispatch as AppDispatch)(logoutAction());
      }
    }, 1000);
  }

  if (removeExpiresAt.match(action)) {
    if (timer) clearInterval(timer);
    sessionExpiryService.removeExpiresAt();
  }

  if (logoutAction.fulfilled.match(action)) {
    if (timer) clearInterval(timer);
    store.dispatch(removeExpiresAt());
  }

  return result;
};

export default sessionTimerMiddleware;
