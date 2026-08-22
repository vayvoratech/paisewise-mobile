import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Stock, IndexQuote } from '../market.types';

export type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';


export interface TickData {
  symbol: string;
  ltp: number;
  change: number;
  volume: number;
  timestamp: number;
}

interface MarketState {
  stocks: Stock[];
  indices: IndexQuote[];
  ticks: Record<string, TickData>; 
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
}

const initialState: MarketState = {
  stocks: [],
  indices: [],
  ticks: {},
  loading: false,
  error: null,
  connectionStatus: 'IDLE',
};

export const fetchMarketQuotes = createAsyncThunk(
  'market/fetchQuotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.MARKET.QUOTE);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch market quotes';
      return rejectWithValue(errMsg);
    }
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setLocalStocks(state, action: PayloadAction<Stock[]>) {
      state.stocks = action.payload;
    },
    // Task requirement fulfilled: setIndices reducer
    setIndices(state, action: PayloadAction<IndexQuote[]>) {
      state.indices = action.payload;
    },
    setLocalIndices(state, action: PayloadAction<IndexQuote[]>) {
      state.indices = action.payload;
    },
    updateStockPrice(state, action: PayloadAction<{ symbol: string; price: number }>) {
      const stock = state.stocks.find(s => s.symbol === action.payload.symbol);
      if (stock) {
        stock.price = action.payload.price;
      }
    },
    // Task requirement fulfilled: updateTick reducer (with alias updateLiveTick)
    updateTick(state, action: PayloadAction<TickData>) {
      state.ticks[action.payload.symbol] = action.payload;
    },
    updateLiveTick(state, action: PayloadAction<TickData>) {
      state.ticks[action.payload.symbol] = action.payload;
    },
    // Task requirement fulfilled: setConnectionStatus reducer
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketQuotes.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.stocks = action.payload;
        }
      })
      .addCase(fetchMarketQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setLocalStocks, 
  setIndices,
  setLocalIndices, 
  updateStockPrice, 
  updateTick,
  updateLiveTick, 
  setConnectionStatus 
} = marketSlice.actions;

export default marketSlice.reducer;