export type FundCategory = 'large' | 'mid' | 'debt';
export type FilterCategory = 'all' | FundCategory;
export type RiskLevel = 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';

export interface NAVPoint {
  date: string;
  value: number;
}

export interface ReturnsPeriod {
  period: '1M' | '6M' | '1Y' | '3Y' | '5Y' | 'Inception';
  fundReturn: number; // percentage, e.g. 18.5
  categoryAvg: number; // percentage, e.g. 15.2
  benchmarkReturn: number; // percentage, e.g. 14.8
}

export interface HoldingItem {
  id: string;
  name: string;
  sector: string;
  allocationPct: number;
  symbol?: string;
  instrumentType?: 'Equity' | 'Debt' | 'Govt Bond' | 'Cash & Equivalent';
}

export interface SectorAllocation {
  sector: string;
  allocationPct: number;
  color?: string;
}

export interface AIRecommendation {
  isRecommended: boolean;
  matchScore: number; // 0 - 100
  badgeText: string; // e.g. "Best 3Y Alpha", "Top Conservative Pick"
  rationale: string;
  pros: string[];
  cons: string[];
}

export interface FundManager {
  name: string;
  experienceYears: number;
  tenureWithFund: string; // e.g. "4.5 Years"
  education: string;
}

export interface MutualFund {
  id: string;
  name: string;
  amc: string; // e.g. "HDFC Mutual Fund"
  amcCode: string; // e.g. "HDFC"
  category: FundCategory;
  categoryLabel: string; // "Large Cap Fund", "Mid Cap Fund", "Corporate Bond Fund"
  planType: string; // "Direct Plan - Growth"
  rating: number; // 1 - 5 stars
  riskLevel: RiskLevel;
  benchmark: string; // e.g. "NIFTY 50 TRI"
  
  // Current Pricing
  currentNav: number;
  navChange: number;
  navChangePct: number;
  navDate: string;

  // Historic Trailing Returns (CAGR for >= 1Y)
  returns1M: number;
  returns6M: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  returnsInception: number;

  // Fund Metrics
  expenseRatio: number; // e.g. 0.68 (%)
  regularExpenseRatio?: number; // e.g. 1.45 (%)
  aumCrores: number; // e.g. 32450 (in ₹ Crores)
  minSipAmount: number; // e.g. 500
  minLumpsumAmount: number; // e.g. 1000
  exitLoad: string; // e.g. "1.0% if redeemed within 1 year; Nil after"
  lockInPeriod: string; // "None" or "3 Years"
  turnoverRatioPct?: number; // e.g. 24%
  sharpeRatio?: number; // e.g. 1.25
  beta?: number; // e.g. 0.92

  // Key relationships
  manager: FundManager;
  aiRecommendation: AIRecommendation;
  topHoldings: HoldingItem[];
  sectorAllocations: SectorAllocation[];
  returnsComparison: ReturnsPeriod[];
  navHistory: Record<'1M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL', NAVPoint[]>;
}
