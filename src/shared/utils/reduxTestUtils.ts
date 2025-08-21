import { configureStore } from '@reduxjs/toolkit';

import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import catalogsReducer, { initialCatalogsState } from '@application/state/slices/catalogsSlice';
import profileReducer, { initialProfileState } from '@application/state/slices/profileSlice';
import sessionTimerReducer from '@application/state/slices/sessionTimerSlice';
import type { RootState } from '@domain/types/redux';
import { SessionTimerState } from '@domain/types/sessionTimer';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const initialSessionTimerState: SessionTimerState = {
  expiresAt: 0,
  showModal: false,
};

export function makeTestStore(preloadedState?: DeepPartial<RootState>, extra?: unknown) {
  return configureStore({
    reducer: {
      auth: authReducer,
      sessionTimer: sessionTimerReducer,
      catalogs: catalogsReducer,
      profile: profileReducer,
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
      catalogs: {
        ...initialCatalogsState,
        ...((preloadedState?.catalogs ?? {}) as object),
      },
      profile: {
        ...initialProfileState,
        ...((preloadedState?.profile ?? {}) as object),
      },
    } as RootState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false, thunk: { extraArgument: extra } }),
  });
}
