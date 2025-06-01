import axios, { AxiosHeaders } from 'axios';

import { localStorageService } from '@/infrastructure/storage/localStorageService';
import { resetTimer } from '@application/state/slices/sessionTimerSlice';
import { store } from '@application/state/store';
import { API_ROUTES } from '@shared/constants/apiRoutes';

console.log('Registrando interceptor de Axios');

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
  withCredentials: true, // Send cookies in cross-origin requests
});

api.interceptors.request.use(
  config => {
    // Get authentication token from local storage

    const token = store.getState().auth.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If there is a token, add it to the headers

    if (token) {
      if (!config.headers) config.headers = {} as AxiosHeaders;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    const url = response.config.url || '';

    if (JSON.parse(String(process.env.REACT_APP_ENABLE_ANALYTICS).toLowerCase())) {
      console.log('Analytics tracking enabled for API calls');
    }

    // If the URL is in the list of endpoints that renew the session
    if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
      store.dispatch(resetTimer());
    }

    return response;
  },

  error => {
    const url = error.config?.url || '';

    if (error.response?.status === 401) {
      console.error('Authentication error:', error.code, error.message);

      // Clear invalid token
      localStorageService.remove('REACT_APP_AUTH_TOKEN_KEY');
      localStorageService.remove('REACT_APP_REFRESH_TOKEN_KEY');
    }
    // If the URL is in the list of endpoints that renew the session
    if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
      store.dispatch(resetTimer());
    }

    return Promise.reject(error);
  }
);

export default api;
