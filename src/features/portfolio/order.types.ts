export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP LOSS';
export type OrderProduct = 'CNC' | 'MIS' | 'NRML';
export type OrderStatus = 'PENDING' | 'OPEN' | 'PARTIAL' | 'COMPLETE' | 'CANCELLED' | 'REJECTED';
export type TradingMode = 'PRACTICE' | 'REAL';

export interface PlaceOrderRequest {
  symbol: string;
  exchange?: string;
  side: OrderSide;
  orderType: OrderType;
  product?: OrderProduct;
  quantity: number;
  price: number;
  triggerPrice?: number;
  validity?: 'DAY' | 'IOC';
  isPaper?: boolean;
}

export interface OrderReceipt {
  orderId: string;
  userId?: string;
  clientOrderId: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  orderType: OrderType;
  product: OrderProduct;
  quantity: number;
  filledQty: number;
  price: number;
  avgPrice: number;
  status: OrderStatus;
  brokerOrderId?: string;
  message?: string;
  placedAt: string;
  updatedAt?: string;
  isPaper?: boolean;
}

export interface RiskStatus {
  userId: string;
  availableLedgerBalance: number;
  maxOpenPositions: number;
  maxOrdersPerMinute: number;
  requiredKycStatus: string;
}

export interface TradeHistoryItem {
  id: string;
  orderId: string;
  brokerOrderId?: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: string;
  status: OrderStatus;
  isPaper?: boolean;
}
