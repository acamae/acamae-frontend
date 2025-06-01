import { localStorageService } from '@infrastructure/storage/localStorageService';

const SESSION_EXPIRES_AT_KEY = 'sessionExpiresAt';

export const sessionExpiryService = {
  getExpiresAt(): number | null {
    const value = localStorageService.get(SESSION_EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },
  setExpiresAt(expiresAt: number): void {
    localStorageService.set(SESSION_EXPIRES_AT_KEY, expiresAt.toString());
  },
  removeExpiresAt(): void {
    localStorageService.remove(SESSION_EXPIRES_AT_KEY);
  },
};
