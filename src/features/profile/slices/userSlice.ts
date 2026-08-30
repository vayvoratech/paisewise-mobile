import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

interface UserProfile {
<<<<<<< HEAD
  id: string;
  name: string;
  email: string;
  phone: string;
  tier?: string;
  xp?: number;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.accessToken;
      const response = await axios.get(API_ENDPOINTS.PORTFOLIO.SUMMARY, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // returns profile/summary summary payload
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch user profile';
      return rejectWithValue(errMsg);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
=======
 id: string;
 name: string;
 email: string;
 phone: string;
 tier?: string;
 xp?: number;
}

interface UserState {
 profile: UserProfile | null;
 loading: boolean;
 error: string | null;
}

const initialState: UserState = {
 profile: null,
 loading: false,
 error: null,
};

export const fetchUserProfile = createAsyncThunk(
 'user/fetchProfile',
 async (_, { getState, rejectWithValue }) => {
   try {
     const state: any = getState();
     const token = state.auth.accessToken;
     const response = await axios.get(API_ENDPOINTS.PORTFOLIO.SUMMARY, {
       headers: { Authorization: `Bearer ${token}` },
     });
     return response.data; // returns profile/summary summary payload
   } catch (err: any) {
     const errMsg = err.response?.data?.message || err.message || 'Failed to fetch user profile';
     return rejectWithValue(errMsg);
   }
 }
);

const userSlice = createSlice({
 name: 'user',
 initialState,
 reducers: {
   clearProfile(state) {
     state.profile = null;
     state.error = null;
   },
 },
 extraReducers: (builder) => {
   builder
     .addCase(fetchUserProfile.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
       state.loading = false;
       state.profile = action.payload;
     })
     .addCase(fetchUserProfile.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload as string;
     });
 },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
>>>>>>> origin/develop
