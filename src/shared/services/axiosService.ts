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

    // Handle errors globally
    console.error('Axios Response Error:', error);

    // Optionally, we can perform specific actions based on the error status
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);

      if (error.response?.status === 401) {
        console.error('Authentication error:', error.code, error.message);

        // Clear invalid token
        localStorageService.remove('REACT_APP_AUTH_TOKEN_KEY');
        localStorageService.remove('REACT_APP_REFRESH_TOKEN_KEY');
      }

      if (SESSION_RENEWAL_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
        store.dispatch(resetTimer());
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }

    // We can choose to rethrow the error or handle it as needed
    return Promise.reject(error);
  }
);

export default api;
