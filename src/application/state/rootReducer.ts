import { persistReducer } from 'redux-persist';

import authReducer from '@application/state/slices/authSlice';
import preferencesReducer from '@application/state/slices/preferencesSlice';
import sessionTimerReducer from '@application/state/slices/sessionTimerSlice';

import { authPersistConfig } from './persistConfig';

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = {
  auth: persistedAuthReducer,
  sessionTimer: sessionTimerReducer,
  preferences: preferencesReducer,
};

export default rootReducer;
