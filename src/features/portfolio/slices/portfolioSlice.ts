import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Holding } from '../portfolio.types';

interface PortfolioState {
  cash: number;
  holdings: Holding[];
  xp: number;
  invested: number;
  holdingsValue: number;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  cash: 84320, // virtual ₹84.32k starting seed
  xp: 1240,    // starting seed XP
  holdings: [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      emoji: '🛢️',
      shares: 5,
      avgPrice: 2900,
      currentPrice: 2952,
      note: "You bought 5 shares at ₹2,900. Now ₹2,952. You've made ₹262 profit! 🎉",
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      emoji: '💻',
      shares: 3,
      avgPrice: 3850,
      currentPrice: 3801,
      note: "TCS is slightly down — IT sector news. Don't panic! Long-term IT stocks always recover. This is normal.",
    },
  ],
  invested: 26050, // (5 * 2900) + (3 * 3850)
  holdingsValue: 26163, // (5 * 2952) + (3 * 3801)
  loading: false,
  error: null,
};

export const fetchPortfolioSummary = createAsyncThunk(
  'portfolio/fetchSummary',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.accessToken;
      const response = await axios.get(API_ENDPOINTS.PORTFOLIO.SUMMARY, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { cash, holdings, xp }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch portfolio summary';
      return rejectWithValue(errMsg);
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    buyStock(state, action: PayloadAction<{ symbol: string; name: string; emoji: string; shares: number; price: number }>) {
      const { symbol, name, emoji, shares, price } = action.payload;
      const cost = Math.round(shares * price);
      
      state.cash -= cost;
      state.xp += 25; // Gain 25 XP for a practice trade!

      const existing = state.holdings.find(h => h.symbol === symbol);
      if (existing) {
        const totalShares = existing.shares + shares;
        const newAvg = (existing.avgPrice * existing.shares + price * shares) / totalShares;
        existing.shares = totalShares;
        existing.avgPrice = Math.round(newAvg);
        existing.currentPrice = price;
      } else {
        state.holdings.push({
          symbol,
          name,
          emoji,
          shares,
          avgPrice: price,
          currentPrice: price,
          note: `You bought ${shares} shares at ₹${Math.round(price)}. Practice position opened.`,
        });
      }

      // Recalculate valuations
      state.invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
      state.holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    },
    sellStock(state, action: PayloadAction<{ symbol: string; shares: number; price: number }>) {
      const { symbol, shares, price } = action.payload;
      const proceeds = Math.round(shares * price);

      const existing = state.holdings.find(h => h.symbol === symbol);
      if (existing) {
        if (existing.shares <= shares) {
          // Remove holding
          state.holdings = state.holdings.filter(h => h.symbol !== symbol);
        } else {
          existing.shares -= shares;
        }
        state.cash += proceeds;
        state.xp += 25;

        // Recalculate valuations
        state.invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
        state.holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
      }
    },
    resetPortfolio: (state) => {
      state.cash = 100_000;
      state.holdings = [];
      state.invested = 0;
      state.holdingsValue = 0;
      state.xp = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioSummary.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.cash = action.payload.cash;
        state.holdings = action.payload.holdings;
        state.xp = action.payload.xp;
        state.invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
        state.holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
      })
      .addCase(fetchPortfolioSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { buyStock, sellStock, resetPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;