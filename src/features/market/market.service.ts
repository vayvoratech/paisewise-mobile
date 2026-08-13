import axios from 'axios';
import { BASE_URL } from '../../core/api/apiEndpoints';
import { tokenStore } from '../../core/security/secureStore';
import { IndexQuote, Stock } from './market.types';

async function getHeaders() {
  const token = await tokenStore.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const marketService = {
  async getTopStocks(): Promise<Stock[]> {
    try {
      const headers = await getHeaders();
      const response = await axios.post(
        `${BASE_URL}/market/quotes`,
        ['NSE:RELIANCE', 'NSE:TCS', 'NSE:INFY', 'NSE:HDFCBANK', 'NSE:ICICIBANK'],
        { headers }
      );
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch top stocks from backend:', error);
      return [];
    }
  },

  async getStock(symbol: string): Promise<Stock | undefined> {
    try {
      const headers = await getHeaders();
      const response = await axios.get(`${BASE_URL}/market/quote`, {
        params: { symbol },
        headers,
      });
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch quote for ${symbol} from backend:`, error);
      return undefined;
    }
  },

  async getMarketIndices(): Promise<IndexQuote[]> {
    try {
      const headers = await getHeaders();
      const response = await axios.get(`${BASE_URL}/market/indices`, { headers });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch market indices from backend:', error);
      return [];
    }
  },
};
