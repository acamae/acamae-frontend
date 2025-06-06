import { configureStore } from '@reduxjs/toolkit';

import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import sessionTimerReducer from '@application/state/slices/sessionTimerSlice';
import type { RootState } from '@domain/types/redux';
import { SessionTimerState } from '@domain/types/sessionTimer';

const initialSessionTimerState: SessionTimerState = {
  expiresAt: 0,
  showModal: false,
};

export function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      sessionTimer: sessionTimerReducer,
    },
    preloadedState: {
      auth: {
        ...initialAuthState,
        ...preloadedState?.auth,
      },
      sessionTimer: {
        ...initialSessionTimerState,
        ...preloadedState?.sessionTimer,
      },
    } as RootState,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  });
}
