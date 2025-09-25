import axios from "axios";
import { API_CONFIG, AUTH_CONFIG, ROUTES } from "../config/constants";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens and redirect to login
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      
      // Only redirect if not already on auth pages
      if (window.location.pathname !== ROUTES.SIGN_IN && 
          window.location.pathname !== ROUTES.SIGN_UP &&
          window.location.pathname !== ROUTES.RESET_PASSWORD) {
        window.location.href = ROUTES.SIGN_IN;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
