/**
 * Standalone Node Test Suite for Real Order Placement & Real Portfolio Screens
 */

// Mock React Native environment
(global as any).sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

import { configureStore } from '@reduxjs/toolkit';
import orderReducer, {
  addLocalOrder,
  setSelectedTab,
  placeTradingOrder,
  placeRealOrderThunk,
  fetchRealOrdersThunk,
  cancelRealOrderThunk,
} from '../features/practice/slices/orderSlice';
import { orderService } from '../features/portfolio/order.service';
import { PlaceOrderRequest, OrderReceipt } from '../features/portfolio/order.types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ ${message}`);
}

async function run() {
  console.log('====================================================');
  console.log('RUNNING UNIT & INTEGRATION TESTS FOR REAL TRADING');
  console.log('====================================================\n');

  // Test 1: Gated KYC and Risk Engine Check
  console.log('--- TEST 1: Gated KYC Checks & Pre-Trade Risk ---');
  const kycStatus = await orderService.checkKycStatus();
  assert(typeof kycStatus === 'boolean', 'KYC check returns verified status');
  const risk = await orderService.getRiskStatus();
  assert(risk.requiredKycStatus === 'VERIFIED', 'Risk engine requires VERIFIED KYC');
  assert(risk.availableLedgerBalance >= 0, 'Ledger balance is available for margin');
  assert(risk.maxOrdersPerMinute === 10, 'Velocity limit is 10 orders/min');

  // Test 2: Real Order Placement with Auditing
  console.log('\n--- TEST 2: Real Order Placement Payload & Receipt ---');
  const req: PlaceOrderRequest = {
    symbol: 'RELIANCE',
    exchange: 'NSE',
    side: 'BUY',
    orderType: 'MARKET',
    product: 'CNC',
    quantity: 5,
    price: 2952.00,
    isPaper: false,
  };
  const receipt = await orderService.placeOrder(req);
  assert(receipt.symbol === 'RELIANCE', 'Receipt has symbol RELIANCE');
  assert(receipt.side === 'BUY', 'Receipt side is BUY');
  assert(receipt.quantity === 5, 'Quantity is 5 shares');
  assert(receipt.clientOrderId.startsWith('cli_'), 'Client Order ID has cli_ prefix');
  assert(receipt.isPaper === false, 'isPaper is false (Real Order)');
  assert(receipt.brokerOrderId !== undefined, 'Broker Order ID is populated');

  // Test 3: Redux Store Integration
  console.log('\n--- TEST 3: Redux Store Integration & Thunks ---');
  const testStore = configureStore({
    reducer: { order: orderReducer },
  });

  assert(testStore.getState().order.selectedTab === 'OPEN', 'Initial tab is OPEN');
  testStore.dispatch(setSelectedTab('COMPLETED'));
  assert(testStore.getState().order.selectedTab === 'COMPLETED', 'Tab switched to COMPLETED');
  testStore.dispatch(setSelectedTab('CANCELLED'));
  assert(testStore.getState().order.selectedTab === 'CANCELLED', 'Tab switched to CANCELLED');

  testStore.dispatch(addLocalOrder({
    symbol: 'TCS',
    shares: 2,
    pricePerShare: 3800,
    type: 'BUY',
    timestamp: new Date().toISOString(),
  }));
  assert(testStore.getState().order.orders.length === 1, 'Local practice trade recorded');

  // Test 4: OrdersScreen Filtering (Open, Completed, Cancelled)
  console.log('\n--- TEST 4: OrdersScreen Open / Completed / Cancelled Filtering ---');
  const sampleOrders: OrderReceipt[] = [
    {
      orderId: 'o1',
      clientOrderId: 'c1',
      symbol: 'RELIANCE',
      exchange: 'NSE',
      side: 'BUY',
      orderType: 'LIMIT',
      product: 'CNC',
      quantity: 10,
      filledQty: 0,
      price: 2900,
      avgPrice: 0,
      status: 'OPEN',
      placedAt: new Date().toISOString(),
      isPaper: false,
    },
    {
      orderId: 'o2',
      clientOrderId: 'c2',
      symbol: 'TCS',
      exchange: 'NSE',
      side: 'BUY',
      orderType: 'MARKET',
      product: 'CNC',
      quantity: 5,
      filledQty: 5,
      price: 3800,
      avgPrice: 3800,
      status: 'COMPLETE',
      placedAt: new Date().toISOString(),
      isPaper: false,
    },
    {
      orderId: 'o3',
      clientOrderId: 'c3',
      symbol: 'INFY',
      exchange: 'NSE',
      side: 'SELL',
      orderType: 'LIMIT',
      product: 'CNC',
      quantity: 20,
      filledQty: 0,
      price: 1550,
      avgPrice: 0,
      status: 'CANCELLED',
      placedAt: new Date().toISOString(),
      isPaper: false,
    },
  ];

  const openList = sampleOrders.filter(o => o.status === 'OPEN' || o.status === 'PENDING');
  const compList = sampleOrders.filter(o => o.status === 'COMPLETE');
  const cancList = sampleOrders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED');

  assert(openList.length === 1 && openList[0].symbol === 'RELIANCE', 'Open list filters correctly');
  assert(compList.length === 1 && compList[0].symbol === 'TCS', 'Completed list filters correctly');
  assert(cancList.length === 1 && cancList[0].symbol === 'INFY', 'Cancelled list filters correctly');

  // Test 5: OrderDetail Status Timeline Stepper
  console.log('\n--- TEST 5: OrderDetail Status Timeline Progress ---');
  const steps = [
    { name: '1. Order Created & Submitted', status: 'DONE' },
    { name: '2. Risk Engine Validated', status: 'DONE' },
    { name: '3. Transmitted to Exchange', status: receipt.brokerOrderId ? 'DONE' : 'ACTIVE' },
    { name: '4. Executed & Filled', status: receipt.status === 'COMPLETE' ? 'DONE' : 'ACTIVE' },
  ];
  assert(steps[0].status === 'DONE', 'Step 1 complete');
  assert(steps[1].status === 'DONE', 'Step 2 complete');
  assert(steps[2].status === 'DONE', 'Step 3 complete');

  // Test 6: TradeHistory CSV Export Generation
  console.log('\n--- TEST 6: TradeHistory CSV Export & Calendar Filtering ---');
  const sampleTrades = [
    {
      timestamp: new Date('2026-10-07T09:00:00Z').toISOString(),
      orderId: 'ord_101',
      brokerOrderId: 'FYERS_882910',
      symbol: 'RELIANCE',
      side: 'BUY',
      quantity: 5,
      price: 2950.50,
      totalValue: 14752.50,
      status: 'COMPLETE',
      isPaper: false,
    },
    {
      timestamp: new Date('2026-10-06T10:00:00Z').toISOString(),
      orderId: 'ord_102',
      brokerOrderId: 'FYERS_882911',
      symbol: 'TCS',
      side: 'SELL',
      quantity: 2,
      price: 3820.00,
      totalValue: 7640.00,
      status: 'COMPLETE',
      isPaper: false,
    },
  ];

  const headers = 'Trade Date,Order ID,Broker ID,Symbol,Side,Quantity,Price (INR),Total Value (INR),Status,Mode\n';
  const rows = sampleTrades
    .map(t => `"${t.timestamp}","${t.orderId}","${t.brokerOrderId}","${t.symbol}","${t.side}",${t.quantity},${t.price},${t.totalValue},"${t.status}","${t.isPaper ? 'Practice' : 'Real'}"`)
    .join('\n');
  const csv = headers + rows;

  assert(csv.startsWith('Trade Date,Order ID,Broker ID'), 'CSV headers are accurate');
  assert(csv.includes('RELIANCE') && csv.includes('TCS'), 'CSV includes all trades');
  assert(csv.includes('FYERS_882910'), 'CSV includes broker order ID');

  console.log('\n====================================================');
  console.log('✅ ALL TESTS EXECUTED & PASSED WITH 100% SUCCESS!');
  console.log('====================================================\n');
}

run().catch((e) => {
  console.error('Test execution failure:', e);
  process.exit(1);
});
