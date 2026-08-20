// src/hooks/useLiveTick.ts
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { TickData } from '../features/market/slices/marketSlice';

export type { TickData };

export function useLiveTick(symbol: string): TickData | undefined {
  return useSelector((state: RootState) => state.market?.ticks?.[symbol]);
}