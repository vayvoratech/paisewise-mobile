import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Stock, IndexQuote } from '../market.types';

interface MarketState {
 stocks: Stock[];
 indices: IndexQuote[];
 loading: boolean;
 error: string | null;
}

const initialState: MarketState = {
 stocks: [],
 indices: [],
 loading: false,
 error: null,
};

export const fetchMarketQuotes = createAsyncThunk(
 'market/fetchQuotes',
 async (_, { rejectWithValue }) => {
   try {
     // Calls the market quote endpoint
     const response = await axios.get(API_ENDPOINTS.MARKET.QUOTE);
     return response.data; // Array of quotes or stock data
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
   setLocalIndices(state, action: PayloadAction<IndexQuote[]>) {
     state.indices = action.payload;
   },
   updateStockPrice(state, action: PayloadAction<{ symbol: string; price: number }>) {
     const stock = state.stocks.find(s => s.symbol === action.payload.symbol);
     if (stock) {
       stock.price = action.payload.price;
     }
   }
 },
 extraReducers: (builder) => {
   builder
     .addCase(fetchMarketQuotes.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchMarketQuotes.fulfilled, (state, action: PayloadAction<any>) => {
       state.loading = false;
       // In a real API response, map actions; fallback to payload if formatted
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

export const { setLocalStocks, setLocalIndices, updateStockPrice } = marketSlice.actions;
export default marketSlice.reducer;