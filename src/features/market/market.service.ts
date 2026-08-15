/**
 * Market data service. Mock implementation now; swap to the `accounts`/market
 * microservice via getServiceClient('accounts') later without touching screens.
 */
import { IndexQuote, Stock } from './market.types';

const STOCKS: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2952,
    changePct: 1.2,
    emoji: '🛢️',
    trend: [2890, 2905, 2898, 2920, 2912, 2935, 2948, 2941, 2952],
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 3801,
    changePct: -0.8,
    emoji: '💻',
    trend: [3850, 3845, 3838, 3842, 3825, 3818, 3810, 3805, 3801],
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    price: 1456,
    changePct: -0.6,
    emoji: '🖥️',
    trend: [1470, 1468, 1472, 1465, 1466, 1460, 1458, 1457, 1456],
  },
];

const INDICES: IndexQuote[] = [
  { symbol: 'RELIANCE', value: 2952, changePct: 1.2 },
  { symbol: 'TCS', value: 3801, changePct: -0.8 },
  { symbol: 'NIFTY', value: 22456, changePct: 0.5 },
];

export const marketService = {
  async getTopStocks(): Promise<Stock[]> {
    return STOCKS;
  },
  async getStock(symbol: string): Promise<Stock | undefined> {
    return STOCKS.find((s) => s.symbol === symbol);
  },
  async getMarketIndices(): Promise<IndexQuote[]> {
    return INDICES;
  },
};
