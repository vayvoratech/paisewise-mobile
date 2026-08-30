import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/onboarding/slices/authSlice';
import userReducer from '../features/profile/slices/userSlice';
import marketReducer from '../features/market/slices/marketSlice';
import portfolioReducer from '../features/portfolio/slices/portfolioSlice';
import learnReducer from '../features/learn/slices/learnSlice';
import orderReducer from '../features/practice/slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    learn: learnReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
