import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/onboarding/slices/authSlice';
import userReducer from '../features/profile/slices/userSlice';
import marketReducer from '../features/market/slices/marketSlice';
import portfolioReducer from '../features/portfolio/slices/portfolioSlice';
import learnReducer from '../features/learn/slices/learnSlice';
import orderReducer from '../features/practice/slices/orderSlice';
import sipReducer from '../features/sip/slices/sipSlice';
import mfPortfolioReducer from '../features/portfolio/slices/mfPortfolioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    learn: learnReducer,
    order: orderReducer,
    sip: sipReducer,
    mfPortfolio: mfPortfolioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
