import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

interface Order {
  id?: string;
  symbol: string;
  shares: number;
  pricePerShare: number;
  type: string; // 'BUY' | 'SELL'
  timestamp: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

export const placeTradingOrder = createAsyncThunk(
  'order/placeOrder',
  async (payload: Order, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.accessToken;
      const response = await axios.post(
        API_ENDPOINTS.TRADING.ORDERS,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // returns order receipt
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to place trading order';
      return rejectWithValue(errMsg);
    }
  }
);

export const fetchOrderHistory = createAsyncThunk(
  'order/fetchHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.accessToken;
      const response = await axios.get(API_ENDPOINTS.TRADING.ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // returns array of historical orders
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch order history';
      return rejectWithValue(errMsg);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addLocalOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload); // Prepend to history
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeTradingOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeTradingOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeTradingOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch History
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addLocalOrder } = orderSlice.actions;
export default orderSlice.reducer;
