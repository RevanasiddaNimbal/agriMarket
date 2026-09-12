import axios from 'axios';
import { ENV } from '@/config/env';
import { normalizeApiError } from './apiErrorHandler';

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach token if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Token Refreshing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loops for auth endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/api/v1/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('agri_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        if (typeof refreshResponse.data?.has_password === 'boolean') {
          localStorage.setItem('agri_has_password', JSON.stringify(refreshResponse.data.has_password));
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('agri_access_token');
        localStorage.removeItem('agri_auth_session');
        localStorage.removeItem('agri_user');
        window.dispatchEvent(new CustomEvent('agri_auth_expired'));
        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default apiClient;
