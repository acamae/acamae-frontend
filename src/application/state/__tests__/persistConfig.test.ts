import storage from 'redux-persist/lib/storage';

import { authPersistConfig } from '../persistConfig';
import { tokenTransform } from '../tokenTransform';

describe('authPersistConfig', () => {
  it('should have correct key', () => {
    expect(authPersistConfig.key).toBe('auth');
  });

  it('should use localStorage storage', () => {
    expect(authPersistConfig.storage).toBe(storage);
  });

  it('should include tokenTransform', () => {
    expect(authPersistConfig.transforms).toContain(tokenTransform);
  });

  it('should have only one transform', () => {
    expect(authPersistConfig.transforms).toHaveLength(1);
  });
});
