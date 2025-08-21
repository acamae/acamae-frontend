import type { PersistedState } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { tokenTransform } from '@application/state/tokenTransform';
import { localStorageService } from '@infrastructure/storage/localStorageService';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

export const authPersistConfig = {
  key: 'auth',
  storage,
  version: 2,
  transforms: [tokenTransform],
  // Only persist these fields
  whitelist: ['user', 'token', 'isAuthenticated'],
  migrate: async (state: PersistedState | undefined): Promise<PersistedState | undefined> => {
    try {
      // If no previous state, nothing to migrate
      if (!state || typeof state !== 'object') return state;

      const refreshToken = localStorageService.get('__refreshToken__');
      const expiresAt = sessionExpiryService.getExpiresAt();
      const now = Date.now();

      const incoming = state as unknown as {
        user?: unknown;
        token?: string | null;
        isAuthenticated?: boolean;
        _persist?: { version: number; rehydrated: boolean };
      };
      const nextPersist = incoming._persist ?? { version: 2, rehydrated: true };

      // If there is no valid refresh token or the session has expired, drop persisted auth
      if (!refreshToken || !expiresAt || expiresAt <= now) {
        try {
          localStorageService.remove('persist:auth');
          localStorageService.remove('__refreshToken__');
        } catch {}
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          _persist: nextPersist,
        } as unknown as PersistedState;
      }

      // Coerce isAuthenticated to reflect presence of a token
      const coerced = {
        ...incoming,
        isAuthenticated: Boolean(incoming?.token),
        _persist: nextPersist,
      } as const;
      return coerced as unknown as PersistedState;
    } catch {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        _persist: { version: 2, rehydrated: true },
      } as unknown as PersistedState;
    }
  },
};
