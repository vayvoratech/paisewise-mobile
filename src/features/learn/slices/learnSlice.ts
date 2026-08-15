import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Lesson } from '../learn.data';

interface LearnState {
 lessons: Lesson[];
 progress: number; // overall percentage progress
 loading: boolean;
 error: string | null;
}

const initialState: LearnState = {
 lessons: [],
 progress: 0,
 loading: false,
 error: null,
};

export const fetchLessons = createAsyncThunk(
 'learn/fetchLessons',
 async (_, { rejectWithValue }) => {
   try {
     const response = await axios.get(API_ENDPOINTS.LEARNING.LESSONS);
     return response.data; // Array of lessons
   } catch (err: any) {
     const errMsg = err.response?.data?.message || err.message || 'Failed to fetch lessons';
     return rejectWithValue(errMsg);
   }
 }
);

export const updateLearningProgress = createAsyncThunk(
 'learn/updateProgress',
 async (lessonId: string, { getState, rejectWithValue }) => {
   try {
     const state: any = getState();
     const token = state.auth.accessToken;
     const response = await axios.post(
       API_ENDPOINTS.LEARNING.PROGRESS,
       { lessonId },
       { headers: { Authorization: `Bearer ${token}` } }
     );
     return response.data; // Updated progress percent or value
   } catch (err: any) {
     const errMsg = err.response?.data?.message || err.message || 'Failed to update progress';
     return rejectWithValue(errMsg);
   }
 }
);

const learnSlice = createSlice({
 name: 'learn',
 initialState,
 reducers: {
   setLocalLessons(state, action: PayloadAction<Lesson[]>) {
     state.lessons = action.payload;
   },
   incrementLocalProgress(state, action: PayloadAction<number>) {
     state.progress = Math.min(100, state.progress + action.payload);
   }
 },
 extraReducers: (builder) => {
   builder
     // Fetch Lessons
     .addCase(fetchLessons.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchLessons.fulfilled, (state, action: PayloadAction<Lesson[]>) => {
       state.loading = false;
       state.lessons = action.payload;
     })
     .addCase(fetchLessons.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload as string;
     })
     // Update Progress
     .addCase(updateLearningProgress.fulfilled, (state, action: PayloadAction<any>) => {
       if (typeof action.payload === 'number') {
         state.progress = action.payload;
       } else if (action.payload?.progressPercent !== undefined) {
         state.progress = action.payload.progressPercent;
       }
     });
 },
});

export const { setLocalLessons, incrementLocalProgress } = learnSlice.actions;
export default learnSlice.reducer;