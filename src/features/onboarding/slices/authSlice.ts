import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../../core/api/authApi';
import { tokenStorage } from '../../../core/api/tokenStorage';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  language: string;
  goal: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken() || null,
  refreshToken: tokenStorage.getRefreshToken() || null,
  isAuthenticated: !!tokenStorage.getAccessToken(),
  loading: false,
  error: null,
  language: 'English',
  goal: 'learn',
};

// 1. Send OTP Thunk
export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.sendOtp(payload);
      return data;
    } catch (err: any) {
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

      return { user, accessToken, refreshToken };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(errMsg);
    }
  }
);

// 4. Register Thunk (Fixes SignupScreen error)
export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      // Calls login/register depending on your auth API implementation
      const data = await authApi.login(payload); 
      
      const accessToken = data.tokens?.accessToken || data.accessToken;
      const refreshToken = data.tokens?.refreshToken || data.refreshToken;
      const user = data.user || data.profile || data;
      const userId = user?.id || user?._id || user?.userId || data.userId;

      if (accessToken) tokenStorage.setAccessToken(accessToken);
      if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
      if (userId) tokenStorage.setUserId(String(userId));

      return { user, accessToken, refreshToken };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      return rejectWithValue(errMsg);
    }
  }
);

// 5. Refresh Token Thunk
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const currentRefreshToken = state.auth.refreshToken || tokenStorage.getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const data = await authApi.refreshToken(currentRefreshToken);
      const newAccessToken = data.tokens?.accessToken || data.accessToken;

      if (newAccessToken) {
        tokenStorage.setAccessToken(newAccessToken);
      }

      return { accessToken: newAccessToken };
    } catch (err: any) {
      tokenStorage.clearTokens();
      return rejectWithValue(err.response?.data?.message || err.message || 'Token refresh failed');
    }
  }
);

// 6. Logout Thunk
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
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.loading = false;
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
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