import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenStorage } from './tokenStorage';

// Extend config type to track retry attempts
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  timeout: 15000, // 15s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token & Dev Logging
apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} => ${config.url}`, config.data || '');
    }

    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 Handling & Retry Logic
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API Response] ${response.status} => ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call your refresh endpoint (Adjust route as needed per your backend specs)
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com'}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        tokenStorage.setAccessToken(accessToken);
        if (newRefreshToken) {
          tokenStorage.setRefreshToken(newRefreshToken);
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, wipe tokens and force re-authentication
        tokenStorage.clearAll();
        if (__DEV__) {
          console.error('[Auth Refresh Failed] Clearing session credentials.');
        }
        return Promise.reject(refreshError);
      }
    }

    if (__DEV__) {
      console.error(`[API Error] ${error.response?.status} => ${error.message}`, error.response?.data);
    }

    return Promise.reject(error);
  }
);