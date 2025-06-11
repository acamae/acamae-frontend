import storage from 'redux-persist/lib/storage';

import { tokenTransform } from '@application/state/tokenTransform';

export const authPersistConfig = {
  key: 'auth',
  storage,
  transforms: [tokenTransform],
  // Solo persistir estos campos
  whitelist: ['user', 'token', 'isAuthenticated'],
};
