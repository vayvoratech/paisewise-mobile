export type Stock = {
  symbol: string;
  name: string;
  price: number;
  changePct: number; // today's % change
  trend: number[]; // recent price points for the sparkline
  emoji: string;
};

export type IndexQuote = {
  symbol: string;
  value: number;
  changePct: number;
};
