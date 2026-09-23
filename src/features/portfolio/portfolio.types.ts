export type Holding = {
  symbol: string;
  name: string;
  emoji: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  /** Plain-English note shown under the holding. */
  note: string;
};

export type PortfolioSummary = {
  totalValue: number;
  gainAbs: number;
  gainPct: number;
  valueSeries: number[];
  /** "Why changed?" insight banner. */
  insight: string;
};
