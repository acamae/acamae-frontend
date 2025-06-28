import { localStorageService } from '@infrastructure/storage/localStorageService';

const REFRESH_TOKEN_KEY = '__refreshToken__';

let accessToken: string | null = null;

export const tokenService = {
  // Access Token --------------------------------------
  getAccessToken(): string | null {
    return accessToken;
  },
  setAccessToken(token: string | null): void {
    accessToken = token;
  },
  // Refresh Token -------------------------------------
  getRefreshToken(): string | null {
    return localStorageService.get(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string | null): void {
    if (token) {
      localStorageService.set(REFRESH_TOKEN_KEY, token);
    } else {
      localStorageService.remove(REFRESH_TOKEN_KEY);
    }
  },
  // Clear both ----------------------------------------
  clear(): void {
    accessToken = null;
    localStorageService.remove(REFRESH_TOKEN_KEY);
  },
};
