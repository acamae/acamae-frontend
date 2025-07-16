import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { tokenService } from '@infrastructure/storage/tokenService';
import { API_ROUTES } from '@shared/constants/apiRoutes';

// Extend AxiosRequestConfig to include _retry property
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const SESSION_RENEWAL_ENDPOINTS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.REFRESH_TOKEN,
  API_ROUTES.AUTH.ME,
];

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
  withCredentials: true, // Send cookies in cross-origin requests (CORS)
});

// Callbacks configurable to get the token and handle session renewal.
type GetTokenFn = () => string | null | undefined;
type SessionRenewalFn = () => void;

const NOOP: SessionRenewalFn = () => {};

let getTokenFn: GetTokenFn = () => tokenService.getAccessToken();
let onSessionRenewalFn: SessionRenewalFn = NOOP;

const getLazyStore = (): unknown => {
  try {
    const mod = require('@application/state/store');
    return mod?.store ?? null;
  } catch {
    return null;
  }
};

// Minimal types to avoid using any in assertions
type StoreLike = {
  dispatch?: (action: unknown) => void;
  getState?: () => { auth?: { token?: string | null } };
};

type TimerSlice = {
  resetTimer: () => unknown;
};

const dispatchResetTimerFallback = () => {
  try {
    const timerSlice = require('@application/state/slices/sessionTimerSlice') as TimerSlice;
    const store = getLazyStore() as StoreLike;
    store?.dispatch?.(timerSlice.resetTimer());
  } catch {
    // Intentionally ignored: fallback for environments where timerSlice or store is unavailable
  }
};

/**
 * Allows injecting functions to avoid direct dependencies (breaks import cycles).
 * Must be called once during app startup, for example after creating the store.
 */
export const configureAxiosService = (
  options: {
    getToken?: GetTokenFn;
    onSessionRenewal?: SessionRenewalFn;
  } = {}
): void => {
  if (options.getToken) getTokenFn = options.getToken;
  if (options.onSessionRenewal) onSessionRenewalFn = options.onSessionRenewal;
};

/**
 * Convierte cualquier error a string de forma segura, evitando '[object Object]' y referencias circulares.
 */
const safeStringifyError = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error as object));
  } catch {
    if (typeof error === 'object' && error && 'toString' in error) {
      return (error as { toString: () => string }).toString();
    }
    return '[Unknown error]';
  }
};

api.interceptors.request.use(
  config => {
    // Get authentication token from local storage (localStorage)
    let token = getTokenFn();

    // Fallback for tests where configureAxiosService has not been called
    if (!token) {
      const store = getLazyStore() as StoreLike;
      token = store?.getState?.()?.auth?.token ?? null;
    }

    // Ensure headers exists and add Authorization only once
    const headers = (config.headers ??= {} as AxiosHeaders);

    // Only add the header if there is a valid token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  error => {
    const errorMessage = safeStringifyError(error);
    const finalError = error instanceof Error ? error : new Error(errorMessage);
    return Promise.reject(finalError);
  }
);

// Helper functions to reduce cognitive complexity
const handleSessionRenewal = (url: string): void => {
  if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
    if (onSessionRenewalFn !== NOOP) {
      onSessionRenewalFn();
    } else {
      dispatchResetTimerFallback();
    }
  }
};

const handleAnalytics = (): void => {
  try {
    const enableAnalytics = process.env.REACT_APP_ENABLE_ANALYTICS;
    if (enableAnalytics && JSON.parse(String(enableAnalytics).toLowerCase())) {
      // No-op: analytics activado
    }
  } catch {
    // Silently ignore JSON parse errors
  }
};

const handleTokenRefresh = async (
  originalRequest: ExtendedAxiosRequestConfig
): Promise<AxiosResponse | null> => {
  if (originalRequest._retry) return null;

  originalRequest._retry = true;

  try {
    const newTokens = await refreshToken();
    if (newTokens) {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return api(originalRequest);
    }
  } catch {
    /* refresh falló, seguir para logout */
  }

  return null;
};

const handleUnauthorizedError = async (error: AxiosError): Promise<AxiosResponse | null> => {
  if (error.response?.status !== 401) return null;

  const originalRequest = error.config as ExtendedAxiosRequestConfig;
  if (!originalRequest) return null;

  const retryResult = await handleTokenRefresh(originalRequest);

  if (retryResult) return retryResult;

  tokenService.clear();
  return null;
};

const createErrorInstance = (error: unknown): Error => {
  if (error instanceof Error) return error;

  const errorMessage = safeStringifyError(error);
  return new Error(errorMessage);
};

const logError = (error: unknown): void => {
  if (process.env.NODE_ENV === 'test') return;

  const axiosError = error as AxiosError;
  if (axiosError.response) {
    console.error('Response:', axiosError.response);
  } else if (axiosError.request) {
    console.error('No response received. Request:', axiosError.message, axiosError.code);
  } else {
    console.error('Request Error:', axiosError.message, axiosError.code);
  }
};

api.interceptors.response.use(
  response => {
    const url = response.config.url ?? '';
    handleSessionRenewal(url);
    handleAnalytics();
    return response;
  },

  async error => {
    const url = error.config?.url ?? '';

    if (error.response) {
      const retryResult = await handleUnauthorizedError(error);
      if (retryResult) return retryResult;

      handleSessionRenewal(url);
    }

    logError(error);
    return Promise.reject(createErrorInstance(error));
  }
);

// ---------------------------------------------------------
// Refresh token logic with concurrency guard
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

async function refreshToken(): Promise<TokensResponse | null> {
  if (isRefreshing) {
    // Wait for current refresh to finish
    return new Promise(resolve => {
      pendingRequests.push(token => {
        resolve({ accessToken: token, refreshToken: tokenService.getRefreshToken() ?? '' });
      });
    });
  }

  isRefreshing = true;
  try {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await api.post(API_ROUTES.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefresh } = response.data?.data ?? {};
    if (!accessToken || !newRefresh) throw new Error('Invalid refresh response');

    tokenService.setAccessToken(accessToken);
    tokenService.setRefreshToken(newRefresh);

    pendingRequests.forEach(cb => cb(accessToken));
    pendingRequests = [];

    return { accessToken, refreshToken: newRefresh };
  } catch {
    pendingRequests = [];
    tokenService.clear();
    return null;
  } finally {
    isRefreshing = false;
  }
}

export default api;
