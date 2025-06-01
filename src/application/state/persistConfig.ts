import storage from 'redux-persist/lib/storage';

import { tokenTransform } from '@application/state/tokenTransform';

export const authPersistConfig = {
  key: 'auth',
  storage,
  transforms: [tokenTransform],
};
