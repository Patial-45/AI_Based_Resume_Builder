import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
let csrfToken: string | null = null;
export const setCsrfToken = (value: string | null) => { csrfToken = value; };
export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') =>
  axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
    ? error.response.data.message : fallback;

export const api = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 90000 });
export const authAPI = api;
const requestSessions = new WeakMap<object, string | null>();
api.interceptors.request.use(config => {
  requestSessions.set(config, csrfToken);
  if (csrfToken && !['get', 'head', 'options'].includes(config.method || 'get')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config && requestSessions.get(error.config) === csrfToken &&
      !['/auth/login', '/auth/register', '/auth/profile'].includes(error.config?.url || '')) {
    window.dispatchEvent(new Event('session-expired'));
  }
  return Promise.reject(error);
});


export const isUnauthorized = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 401;
