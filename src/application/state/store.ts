import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

import { feedbackMiddleware } from '@application/state/middleware/feedbackMiddleware';
import sessionTimerMiddleware from '@application/state/middleware/sessionTimerMiddleware';
import rootReducer from '@application/state/rootReducer';
import { resetTimer } from '@application/state/slices/sessionTimerSlice';
import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { ResendVerificationUseCase } from '@application/use-cases/auth/ResendVerificationUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { configureAxiosService } from '@shared/services/axiosService';

// Auth repository
const authRepository = new AuthApiRepository();

// Use cases
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
const resendVerificationUseCase = new ResendVerificationUseCase(authRepository);

// Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        isSerializable: (value: unknown) => {
          return !(value instanceof Function) && typeof value !== 'symbol';
        },
      },
      thunk: {
        extraArgument: {
          loginUseCase,
          registerUseCase,
          logoutUseCase,
          forgotPasswordUseCase,
          resetPasswordUseCase,
          resendVerificationUseCase,
        },
      },
    })
      .concat(sessionTimerMiddleware)
      .concat(feedbackMiddleware),
});

export const persistor = persistStore(store);

// Configure axiosService with functions that depend on the store (token and session renewal)
// Allows injecting functions to avoid direct dependencies (breaks import cycles)
// Must be called once during app startup, for example after creating the store.
configureAxiosService({
  getToken: () => store.getState().auth.token,
  onSessionRenewal: () => store.dispatch(resetTimer()),
});
