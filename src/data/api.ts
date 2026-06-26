import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
}

const isLocal = window.location.hostname === 'localhost';
export const API_URL = isLocal
  ? 'http://localhost:5167/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5167/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {},
  withCredentials: true, // Requerido para enviar y recibir Cookies HttpOnly en peticiones cross-origin
}) as CustomAxiosInstance;

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to unwrap response.data directly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Si la API responde con 401 Unauthorized, la sesión expiró o la cookie es inválida
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fourgym_user');
      window.location.href = '/'; // Redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
