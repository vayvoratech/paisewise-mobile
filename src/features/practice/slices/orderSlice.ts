import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../portfolio/order.service';
import { OrderReceipt, PlaceOrderRequest, RiskStatus } from '../../portfolio/order.types';

export interface PracticeOrder {
  id?: string;
  symbol: string;
  shares: number;
  pricePerShare: number;
  type: string; // 'BUY' | 'SELL'
  timestamp: string;
}

interface OrderState {
  orders: PracticeOrder[];
  realOrders: OrderReceipt[];
  riskStatus: RiskStatus | null;
  loading: boolean;
  error: string | null;
  selectedTab: 'OPEN' | 'COMPLETED' | 'CANCELLED';
}

const initialState: OrderState = {
  orders: [],
  realOrders: [],
  riskStatus: null,
  loading: false,
  error: null,
  selectedTab: 'OPEN',
};

export const placeTradingOrder = createAsyncThunk(
  'order/placeOrder',
  async (payload: PracticeOrder, { rejectWithValue }) => {
    try {
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to place trading order');
    }
  }
);

export const placeRealOrderThunk = createAsyncThunk(
  'order/placeRealOrder',
  async (payload: PlaceOrderRequest, { rejectWithValue }) => {
    try {
      const receipt = await orderService.placeOrder(payload);
      return receipt;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to place real order');
    }
  }
);

export const fetchRealOrdersThunk = createAsyncThunk(
  'order/fetchRealOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getMyOrders();
      return orders;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch real orders');
    }
  }
);

export const cancelRealOrderThunk = createAsyncThunk(
  'order/cancelRealOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const updated = await orderService.cancelOrder(orderId);
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to cancel order');
    }
  }
);

export const fetchRiskStatusThunk = createAsyncThunk(
  'order/fetchRiskStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await orderService.getRiskStatus();
      return status;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch risk status');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addLocalOrder(state, action: PayloadAction<PracticeOrder>) {
      state.orders.unshift(action.payload);
    },
    setSelectedTab(state, action: PayloadAction<'OPEN' | 'COMPLETED' | 'CANCELLED'>) {
      state.selectedTab = action.payload;
    },
    clearOrderError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Practice Place Order
      .addCase(placeTradingOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeTradingOrder.fulfilled, (state, action: PayloadAction<PracticeOrder>) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeTradingOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Real Place Order
      .addCase(placeRealOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeRealOrderThunk.fulfilled, (state, action: PayloadAction<OrderReceipt>) => {
        state.loading = false;
        const exists = state.realOrders.findIndex(o => o.orderId === action.payload.orderId);
        if (exists >= 0) {
          state.realOrders[exists] = action.payload;
        } else {
          state.realOrders.unshift(action.payload);
        }
      })
      .addCase(placeRealOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Real Orders
      .addCase(fetchRealOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRealOrdersThunk.fulfilled, (state, action: PayloadAction<OrderReceipt[]>) => {
        state.loading = false;
        state.realOrders = action.payload;
      })
      .addCase(fetchRealOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel Real Order
      .addCase(cancelRealOrderThunk.fulfilled, (state, action: PayloadAction<OrderReceipt>) => {
        const index = state.realOrders.findIndex(o => o.orderId === action.payload.orderId);
        if (index >= 0) {
          state.realOrders[index] = action.payload;
        }
      })

      // Risk Status
      .addCase(fetchRiskStatusThunk.fulfilled, (state, action: PayloadAction<RiskStatus>) => {
        state.riskStatus = action.payload;
      });
  },
});

export const { addLocalOrder, setSelectedTab, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
