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
  // withCredentials: true, (disabled because backend uses AllowAnyOrigin/AllowAll * CORS policy and does not use cookies)
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
    return Promise.reject(error);
  }
);

export default api;
