import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { learnApi, Lesson } from '../learnApi';

interface LearnState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  completedLessonIds: string[];
  progressPercent: number;
  loading: boolean;
  error: string | null;
}

const initialState: LearnState = {
  lessons: [],
  currentLesson: null,
  completedLessonIds: [],
  progressPercent: 0,
  loading: false,
  error: null,
};

export const fetchLessonsThunk = createAsyncThunk(
  'learn/fetchLessons',
  async (_, { rejectWithValue }) => {
    try {
      return await learnApi.getLessons();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch lessons');
    }
  }
);

export const fetchLessonThunk = createAsyncThunk(
  'learn/fetchLesson',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      return await learnApi.getLesson(lessonId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch lesson detail');
    }
  }
);

export const completeLessonThunk = createAsyncThunk(
  'learn/completeLesson',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      return await learnApi.completeLesson(lessonId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to complete lesson');
    }
  }
);

export const submitQuizThunk = createAsyncThunk(
  'learn/submitQuiz',
  async (payload: { lessonId: string; answers: string[]; timeSpent: number }, { rejectWithValue }) => {
    try {
      return await learnApi.submitQuiz(payload.lessonId, payload.answers, payload.timeSpent);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit quiz');
    }
  }
);

const learnSlice = createSlice({
  name: 'learn',
  initialState,
  reducers: {
    setLessons(state, action: PayloadAction<Lesson[]>) {
      state.lessons = action.payload;
    },
    updateLessonProgress(state, action: PayloadAction<{ lessonId: string; progressPercent: number }>) {
      if (!state.completedLessonIds.includes(action.payload.lessonId)) {
        state.completedLessonIds.push(action.payload.lessonId);
      }
      state.progressPercent = action.payload.progressPercent;
    },
    setCurrentLesson(state, action: PayloadAction<Lesson | null>) {
      state.currentLesson = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchLessonsThunk
      .addCase(fetchLessonsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonsThunk.fulfilled, (state, action: PayloadAction<Lesson[]>) => {
        state.loading = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessonsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchLessonThunk
      .addCase(fetchLessonThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonThunk.fulfilled, (state, action: PayloadAction<Lesson>) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // completeLessonThunk
      .addCase(completeLessonThunk.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload?.completedLessonId && !state.completedLessonIds.includes(action.payload.completedLessonId)) {
          state.completedLessonIds.push(action.payload.completedLessonId);
        }
      })
      // submitQuizThunk
      .addCase(submitQuizThunk.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload?.lessonId && !state.completedLessonIds.includes(action.payload.lessonId)) {
          state.completedLessonIds.push(action.payload.lessonId);
        }
      });
  },
});

export const { setLessons, updateLessonProgress, setCurrentLesson } = learnSlice.actions;
export default learnSlice.reducer;
