import axios, { AxiosHeaders } from 'axios';

import { localStorageService } from '@infrastructure/storage/localStorageService';
import { API_ROUTES } from '@shared/constants/apiRoutes';

const SESSION_RENEWAL_ENDPOINTS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.REGISTER,
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

let getTokenFn: GetTokenFn = () => null;
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
    /* ignore */
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
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

api.interceptors.response.use(
  response => {
    const url = response.config.url ?? '';

    if (JSON.parse(String(process.env.REACT_APP_ENABLE_ANALYTICS).toLowerCase())) {
      console.log('Analytics tracking enabled for API calls');
    }

    // If the URL is in the list of endpoints that renew the session (token expiration)
    if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
      if (onSessionRenewalFn !== NOOP) {
        onSessionRenewalFn();
      } else {
        dispatchResetTimerFallback();
      }
    }

    return response;
  },

  error => {
    const url = error.config?.url ?? '';

    if (error.response) {
      console.error('Response:', error.response);

      // If the status is 401, clear the token (unauthorized)
      if (error.response?.status === 401) {
        localStorageService.remove('REACT_APP_AUTH_TOKEN_KEY');
        localStorageService.remove('REACT_APP_REFRESH_TOKEN_KEY');
      }

      // If the URL is in the list of endpoints that renew the session (token expiration)
      if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
        if (onSessionRenewalFn !== NOOP) {
          onSessionRenewalFn();
        } else {
          dispatchResetTimerFallback();
        }
      }
    } else if (error.request) {
      console.error('No response received. Request:', error.message, error.code);
    } else {
      console.error('Request Error:', error.message, error.code);
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default api;
