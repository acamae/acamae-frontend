import { configureStore } from '@reduxjs/toolkit';

import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import sessionTimerReducer, {
  initialSessionTimerState,
} from '@application/state/slices/sessionTimerSlice';
import type { RootState } from '@domain/types/redux';

export function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      sessionTimer: sessionTimerReducer,
    },
    preloadedState: {
      auth: initialAuthState,
      sessionTimer: initialSessionTimerState,
      ...preloadedState,
    } as RootState,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  });
}
