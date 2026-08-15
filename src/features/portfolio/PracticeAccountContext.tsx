/**
 * Practice (paper-trading) account state. This is the shared source of truth
 * for cash, holdings, and XP across Practice Trading, the Buy/Sell modal,
 * Trade Success, Portfolio, and the Home/Profile stats.
 *
 * NOTE: This is virtual money only — no real funds, matching the app's
 * "PRACTICE MODE — NO REAL MONEY" guarantee. Persisted to AsyncStorage so the
 * session survives app restarts; a real backend would own this server-side.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Holding } from './portfolio.types';

const STORAGE_KEY = 'practice.account.v1';
const STARTING_CASH = 100_000; // virtual ₹1L

type AccountState = {
  cash: number;
  holdings: Holding[];
  xp: number;
};

const SEED: AccountState = {
  cash: 84_320,
  xp: 1_240,
  holdings: [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      emoji: '🛢️',
      shares: 5,
      avgPrice: 2900,
      currentPrice: 2952,
      note: "You bought 5 shares at ₹2,900. Now ₹2,952. You've made ₹262 profit! 🎉",
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      emoji: '💻',
      shares: 3,
      avgPrice: 3850,
      currentPrice: 3801,
      note: "TCS is slightly down — IT sector news. Don't panic! Long-term IT stocks always recover. This is normal.",
    },
  ],
};

type TradeResult = {
  symbol: string;
  shares: number;
  pricePerShare: number;
  totalPaid: number;
  xpEarned: number;
};

type Ctx = AccountState & {
  starting: number;
  invested: number;
  holdingsValue: number;
  buy: (symbol: string, name: string, emoji: string, shares: number, price: number) => TradeResult;
};

const PracticeAccountContext = createContext<Ctx | undefined>(undefined);

export function PracticeAccountProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccountState>(SEED);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState(JSON.parse(raw));
        } catch {
          /* keep seed */
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const buy = useCallback(
    (symbol: string, name: string, emoji: string, shares: number, price: number): TradeResult => {
      const totalPaid = Math.round(shares * price);
      const xpEarned = 25;
      setState((prev) => {
        const existing = prev.holdings.find((h) => h.symbol === symbol);
        let holdings: Holding[];
        if (existing) {
          const newShares = existing.shares + shares;
          const newAvg = (existing.avgPrice * existing.shares + price * shares) / newShares;
          holdings = prev.holdings.map((h) =>
            h.symbol === symbol
              ? { ...h, shares: newShares, avgPrice: Math.round(newAvg), currentPrice: price }
              : h,
          );
        } else {
          holdings = [
            ...prev.holdings,
            {
              symbol,
              name,
              emoji,
              shares,
              avgPrice: Math.round(price),
              currentPrice: price,
              note: `You bought ${shares} shares at ${formatRupee(price)}. Practice position opened.`,
            },
          ];
        }
        return { cash: prev.cash - totalPaid, xp: prev.xp + xpEarned, holdings };
      });
      return { symbol, shares, pricePerShare: price, totalPaid, xpEarned };
    },
    [],
  );

  const invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
  const holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

  const value = useMemo<Ctx>(
    () => ({ ...state, starting: STARTING_CASH, invested, holdingsValue, buy }),
    [state, invested, holdingsValue, buy],
  );

  return <PracticeAccountContext.Provider value={value}>{children}</PracticeAccountContext.Provider>;
}

export function usePracticeAccount(): Ctx {
  const ctx = useContext(PracticeAccountContext);
  if (!ctx) throw new Error('usePracticeAccount must be used within PracticeAccountProvider');
  return ctx;
}

function formatRupee(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
