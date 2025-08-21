import { persistReducer } from 'redux-persist';

import authReducer from '@application/state/slices/authSlice';
import catalogsReducer from '@application/state/slices/catalogsSlice';
import profileReducer from '@application/state/slices/profileSlice';
import sessionTimerReducer from '@application/state/slices/sessionTimerSlice';

import { authPersistConfig } from './persistConfig';

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = {
  auth: persistedAuthReducer,
  sessionTimer: sessionTimerReducer,
  catalogs: catalogsReducer,
  profile: profileReducer,
};

export default rootReducer;
