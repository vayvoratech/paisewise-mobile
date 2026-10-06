import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

export interface Order {
  id?: string;
  clientOrderId?: string;
  symbol: string;
  name?: string;
  emoji?: string;
  shares: number;
  pricePerShare: number;
  limitPrice?: number;
  triggerPrice?: number;
  type: string; // 'BUY' | 'SELL'
  orderCategory?: 'MARKET' | 'LIMIT' | 'STOP LOSS';
  status?: 'OPEN' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [
    {
      id: 'ord-limit-101',
      clientOrderId: 'PW-ORD-LMT-INFY',
      symbol: 'INFY',
      name: 'Infosys Limited',
      emoji: '⚡',
      shares: 10,
      pricePerShare: 1520.0,
      limitPrice: 1520.0,
      type: 'BUY',
      orderCategory: 'LIMIT',
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'ord-limit-102',
      clientOrderId: 'PW-ORD-LMT-TATA',
      symbol: 'TATAMOTORS',
      name: 'Tata Motors Ltd.',
      emoji: '🚗',
      shares: 15,
      pricePerShare: 1015.0,
      limitPrice: 1015.0,
      type: 'SELL',
      orderCategory: 'LIMIT',
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'ord-exec-103',
      clientOrderId: 'PW-ORD-MKT-REL',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      emoji: '🛢️',
      shares: 5,
      pricePerShare: 2900.0,
      type: 'BUY',
      orderCategory: 'MARKET',
      status: 'EXECUTED',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'ord-exec-104',
      clientOrderId: 'PW-ORD-MKT-TCS',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      emoji: '💻',
      shares: 3,
      pricePerShare: 3850.0,
      type: 'BUY',
      orderCategory: 'MARKET',
      status: 'EXECUTED',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ],
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
      const order = action.payload;
      const status = order.status || (order.orderCategory === 'LIMIT' ? 'OPEN' : 'EXECUTED');
      state.orders.unshift({
        ...order,
        status,
        id: order.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      });
    },
    cancelOrder(state, action: PayloadAction<string>) {
      const targetId = action.payload;
      const existing = state.orders.find(
        (o) => o.id === targetId || o.clientOrderId === targetId
      );
      if (existing && existing.status === 'OPEN') {
        existing.status = 'CANCELLED';
      }
    },
    executeOrder(state, action: PayloadAction<string>) {
      const targetId = action.payload;
      const existing = state.orders.find(
        (o) => o.id === targetId || o.clientOrderId === targetId
      );
      if (existing && existing.status === 'OPEN') {
        existing.status = 'EXECUTED';
      }
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

export const { addLocalOrder, cancelOrder, executeOrder } = orderSlice.actions;
export default orderSlice.reducer;
