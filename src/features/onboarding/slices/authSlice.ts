import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, BASE_URL } from '../../../core/api/apiEndpoints';
import { tokenStore, credentialsStore } from '../../../core/security/secureStore';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  language: string;
  goal: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  language: 'English',
  goal: 'learn',
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      const { tokens, user } = response.data;
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        await tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email);
      }
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(errMsg);
    }
  }
);

export const loginUserMpin = createAsyncThunk(
  'auth/loginMpin',
  async (payload: { phone: string; mpin: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login/mpin`, payload);
      const { tokens, user } = response.data;
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        await tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email, payload.mpin);
      }
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.code === 'ACCOUNT_LOCKED' 
        ? 'ACCOUNT_LOCKED'
        : (err.response?.data?.message || err.message || 'MPIN Login failed');
      return rejectWithValue(errMsg);
    }
  }
);

export const configureMpin = createAsyncThunk(
  'auth/configureMpin',
  async (payload: { email: string; mpin: string }, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/auth/set-mpin`, payload);
      const savedPhone = await credentialsStore.getPhone() || '';
      await credentialsStore.saveCredentials(savedPhone, payload.email, payload.mpin);
      return payload.mpin;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to configure MPIN';
      return rejectWithValue(errMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, payload);
      const { tokens, user } = response.data;
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        await tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
      }
      if (user && user.phone && user.email) {
        await credentialsStore.saveCredentials(user.phone, user.email);
      }
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      return rejectWithValue(errMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (refreshToken: string | null, { rejectWithValue }) => {
    try {
      if (refreshToken) {
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (err: any) {
      console.warn('API logout failed:', err.message);
    } finally {
      await tokenStore.clear();
      await credentialsStore.clearMpin();
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
      state.error = null;
      tokenStore.clear().catch(err => console.warn('Clear token store failed:', err));
      credentialsStore.clearMpin().catch(err => console.warn('Clear MPIN failed:', err));
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
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
      .addCase(loginUserMpin.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
      })
      .addCase(loginUserMpin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Configure MPIN
      .addCase(configureMpin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(configureMpin.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.user) {
          state.user.hasMpin = true;
        }
      })
      .addCase(configureMpin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout Thunk
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      });
  },
});

export const { logout, setTokens, setLanguage, setGoal } = authSlice.actions;
export default authSlice.reducer;