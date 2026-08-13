import axios from 'axios';
import { API_ENDPOINTS } from './apiEndpoints';

const BASE_URL = 'http://192.168.29.179:8080';

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface SetMpinPayload {
  email: string;
  mpin: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password?: string;
  mpin?: string;
}

export const authApi = {
  // Send OTP
  sendOtp: async (data: SendOtpPayload) => {
    const response = await axios.post(`${BASE_URL}/auth/send-otp`, data);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpPayload) => {
    const response = await axios.post(`${BASE_URL}/auth/verify-otp`, data);
    return response.data;
  },

  // Set MPIN
  setMpin: async (data: SetMpinPayload) => {
    const response = await axios.post(`${BASE_URL}/auth/set-mpin`, data);
    return response.data;
  },

  // Login
  login: async (data: LoginPayload) => {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string | null) => {
    if (!refreshToken) return;
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    return response.data;
  },
};