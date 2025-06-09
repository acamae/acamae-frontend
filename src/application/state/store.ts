import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

import rootReducer from '@application/state/rootReducer';
import sessionTimerMiddleware from '@application/state/sessionTimerMiddleware';
import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';

// Auth repository
const authRepository = new AuthApiRepository();

// Use cases
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);

// Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      thunk: {
        extraArgument: {
          loginUseCase,
          registerUseCase,
          logoutUseCase,
          forgotPasswordUseCase,
          resetPasswordUseCase,
        },
      },
    }).concat(sessionTimerMiddleware),
});

export const persistor = persistStore(store);
