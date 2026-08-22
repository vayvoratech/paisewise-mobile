// src/core/api/marketApi.ts
import { apiClient } from './apiClient';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
}

/**
 * Fetch latest quotes for a list of symbols
 */
export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  try {
    const response = await apiClient.get(`/market/quotes`, {
      params: { symbols: symbols.join(',') },
    });
    
    // Handles both response.data.quotes or direct response.data arrays safely
    return response.data?.quotes || response.data || [];
  } catch (error) {
    if (__DEV__) {
      console.error('[MarketApi] Failed to fetch quotes:', error);
    }
    throw error;
  }
}

/**
 * Fetch historical candle data for charts
 */
export async function getCandles(
  symbol: string,
  timeframe: string,
  from: number,
  to: number
): Promise<Candle[]> {
  if (!symbol) return [];

  try {
    const response = await apiClient.get(`/market/candles`, {
      params: { symbol, timeframe, from, to },
    });
    
    return response.data?.candles || response.data || [];
  } catch (error) {
    if (__DEV__) {
      console.error(`[MarketApi] Failed to fetch candles for ${symbol}:`, error);
    }
    throw error;
  }
}

/**
 * Search symbols by query string
 */
export async function searchSymbols(query: string): Promise<SymbolInfo[]> {
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const response = await apiClient.get(`/market/search`, {
      params: { q: query.trim() },
    });
    
    return response.data?.symbols || response.data || [];
  } catch (error) {
    if (__DEV__) {
      console.error('[MarketApi] Failed to search symbols:', error);
    }
    throw error;
  }
}

/**
 * Fetch key market indices (e.g., NIFTY, SENSEX)
 */
export async function getIndices(): Promise<MarketIndex[]> {
  try {
    const response = await apiClient.get(`/market/indices`);
    
    return response.data?.indices || response.data || [];
  } catch (error) {
    if (__DEV__) {
      console.error('[MarketApi] Failed to fetch indices:', error);
    }
    throw error;
  }
}