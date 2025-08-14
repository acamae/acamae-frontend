import { configureStore } from '@reduxjs/toolkit';

import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import preferencesReducer, {
  initialPreferencesState,
} from '@application/state/slices/preferencesSlice';
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
      preferences: preferencesReducer,
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
      preferences: {
        ...initialPreferencesState,
        ...(preloadedState?.preferences as unknown),
      },
    } as RootState,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  });
}
