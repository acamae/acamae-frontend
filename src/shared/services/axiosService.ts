import axios, { AxiosHeaders } from 'axios';

import { resetTimer } from '@application/state/slices/sessionTimerSlice';
import { store } from '@application/state/store';
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

api.interceptors.request.use(
  config => {
    // Get authentication token from local storage (localStorage)
    const token = store.getState().auth.token;

    if (token) {
      // Ensure headers exists and add Authorization only once
      const headers = (config.headers ??= {} as AxiosHeaders);
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
      store.dispatch(resetTimer());
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
        store.dispatch(resetTimer());
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
