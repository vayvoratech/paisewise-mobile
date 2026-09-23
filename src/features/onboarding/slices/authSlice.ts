import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { authApi } from '../../../core/api/authApi';
import { tokenStorage } from '../../../core/api/tokenStorage';
import { API_ENDPOINTS, BASE_URL } from '../../../core/api/apiEndpoints';
import { tokenStore, credentialsStore } from '../../../core/security/secureStore';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  level?: number;
  xp?: number;
  xpTotal?: number;
  dayStreak?: number;
  hasMpin?: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  language: string;
  goal: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  language: 'en',
  goal: null,
};

const createDemoSession = (email?: string, name?: string, phone?: string) => {
  const mockUser: UserProfile = {
    id: 'demo-user-1',
    name: name || (email ? email.split('@')[0] : 'Learner'),
    email: email || 'learner@paisewise.in',
    phone: phone || '9876543210',
    level: 1,
    xp: 150,
    hasMpin: true,
  };
  const mockAccessToken = 'demo_access_token_offline_preview';
  const mockRefreshToken = 'demo_refresh_token_offline_preview';

  tokenStorage.setAccessToken(mockAccessToken);
  tokenStorage.setRefreshToken(mockRefreshToken);
  tokenStorage.setUserId(mockUser.id);
  tokenStore.setTokens(mockAccessToken, mockRefreshToken).catch(() => {});
  credentialsStore.saveCredentials(mockUser.phone!, mockUser.email).catch(() => {});
  credentialsStore.saveHasMpin(true).catch(() => {});

  return { user: mockUser, accessToken: mockAccessToken, refreshToken: mockRefreshToken };
};

// 1. Send OTP Thunk
export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (payload: { phone: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.sendOtp(payload);
      return data;
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return { message: 'OTP sent to mobile (Demo Mode)', expiresAt: '10 mins' };
      }
      const errMsg = err.response?.data?.message || err.message || 'Failed to send OTP';
      return rejectWithValue(errMsg);
    }
  }
);

// 2. Verify OTP Thunk
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { identifier: string; otp: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.verifyOtp({ email: payload.identifier, otp: payload.otp });
      return data;
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return createDemoSession(payload.identifier);
      }
      const errMsg = err.response?.data?.message || err.message || 'OTP verification failed';
      return rejectWithValue(errMsg);
    }
  }
);

// 3. Login Thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await authApi.login(payload);
      
      const accessToken = data.tokens?.accessToken || data.accessToken;
      const refreshToken = data.tokens?.refreshToken || data.refreshToken;
      const user = data.user || data.profile || data;
      const userId = user?.id || user?._id || user?.userId || data.userId;

      if (accessToken) tokenStorage.setAccessToken(accessToken);
      if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
      if (userId) tokenStorage.setUserId(String(userId));

      if (accessToken && refreshToken) {
        await tokenStore.setTokens(accessToken, refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email);
        await credentialsStore.saveHasMpin(!!user.hasMpin);
      }

      return { user, accessToken, refreshToken };
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return createDemoSession(payload?.email, payload?.name, payload?.phone);
      }
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(errMsg);
    }
  }
);

// 4. Login MPIN Thunk
export const loginUserMpin = createAsyncThunk(
  'auth/loginMpin',
  async (payload: { phone: string; mpin: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login/mpin`, payload, { timeout: 2000 });
      const { tokens, user } = response.data;
      const accessToken = tokens?.accessToken || response.data.accessToken;
      const refreshToken = tokens?.refreshToken || response.data.refreshToken;

      if (accessToken) tokenStorage.setAccessToken(accessToken);
      if (refreshToken) tokenStorage.setRefreshToken(refreshToken);

      if (accessToken && refreshToken) {
        await tokenStore.setTokens(accessToken, refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email, payload.mpin);
        await credentialsStore.saveHasMpin(true);
      }
      return { user, accessToken, refreshToken };
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return createDemoSession(undefined, 'Demo Investor', payload.phone);
      }
      const errMsg = err.response?.data?.code === 'ACCOUNT_LOCKED' 
        ? 'ACCOUNT_LOCKED'
        : (err.response?.data?.message || err.message || 'MPIN Login failed');
      return rejectWithValue(errMsg);
    }
  }
);

// 5. Configure MPIN Thunk
export const configureMpin = createAsyncThunk(
  'auth/configureMpin',
  async (payload: { email: string; mpin: string }, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/auth/set-mpin`, payload, { timeout: 2000 });
      const savedPhone = await credentialsStore.getPhone() || '';
      await credentialsStore.saveCredentials(savedPhone, payload.email, payload.mpin);
      await credentialsStore.saveHasMpin(true);
      return payload.mpin;
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        const savedPhone = (await credentialsStore.getPhone()) || '9876543210';
        await credentialsStore.saveCredentials(savedPhone, payload.email, payload.mpin);
        await credentialsStore.saveHasMpin(true);
        return payload.mpin;
      }
      const errMsg = err.response?.data?.message || err.message || 'Failed to configure MPIN';
      return rejectWithValue(errMsg);
    }
  }
);

// 6. Register Thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, payload, { timeout: 2000 });
      const { tokens, user } = response.data;
      const accessToken = tokens?.accessToken || response.data.accessToken;
      const refreshToken = tokens?.refreshToken || response.data.refreshToken;

      if (accessToken) tokenStorage.setAccessToken(accessToken);
      if (refreshToken) tokenStorage.setRefreshToken(refreshToken);

      if (accessToken && refreshToken) {
        await tokenStore.setTokens(accessToken, refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email);
        await credentialsStore.saveHasMpin(!!user.hasMpin);
      }
      return { user, accessToken, refreshToken };
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return createDemoSession(payload?.email, payload?.name, payload?.phone);
      }
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      return rejectWithValue(errMsg);
    }
  }
);

// 7. Refresh Token Thunk
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const currentRefreshToken = state.auth.refreshToken || tokenStorage.getRefreshToken();
      
      if (!currentRefreshToken) {
        return createDemoSession();
      }

      const data = await authApi.refreshToken(currentRefreshToken);
      const newAccessToken = data.tokens?.accessToken || data.accessToken;

      if (newAccessToken) {
        tokenStorage.setAccessToken(newAccessToken);
        const currentRef = state.auth.refreshToken || tokenStorage.getRefreshToken() || '';
        await tokenStore.setTokens(newAccessToken, currentRef);
      }

      return { accessToken: newAccessToken };
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        return createDemoSession();
      }
      tokenStorage.clearTokens();
      await tokenStore.clear();
      return rejectWithValue(err.response?.data?.message || err.message || 'Token refresh failed');
    }
  }
);

// 8. Logout Thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state: any = getState();
      const currentRefreshToken = state.auth.refreshToken || tokenStorage.getRefreshToken();
      await authApi.logout(currentRefreshToken);
    } catch (err: any) {
      console.warn('API logout warning:', err.message);
    } finally {
      tokenStorage.clearTokens();
      await tokenStore.clear();
      await credentialsStore.clearAll();
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenStorage.clearTokens();
      tokenStore.clear().catch(err => console.warn('Clear token store failed:', err));
      credentialsStore.clearAll().catch(err => console.warn('Clear credentials failed:', err));
    },
    clearError(state) {
      state.error = null;
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      tokenStorage.setAccessToken(action.payload.accessToken);
      tokenStorage.setRefreshToken(action.payload.refreshToken);
      tokenStore.setTokens(action.payload.accessToken, action.payload.refreshToken).catch(err => console.warn('Save tokens failed:', err));
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setGoal(state, action: PayloadAction<string>) {
      state.goal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login MPIN
      .addCase(loginUserMpin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserMpin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUserMpin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Configure MPIN
      .addCase(configureMpin.fulfilled, (state) => {
        if (state.user) {
          state.user.hasMpin = true;
        }
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshTokenThunk.fulfilled, (state, action: any) => {
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { logout, clearError, setTokens, setLanguage, setGoal } = authSlice.actions;
export default authSlice.reducer;