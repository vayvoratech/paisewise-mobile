import { FundCategory } from '../sip/sip.types';

export interface MFHolding {
  id: string;
  fundId: string;
  fundName: string;
  amc: string;
  category: FundCategory;
  units: number;
  avgNav: number;
  currentNav: number;
  navDate: string;
  investedAmount: number;
  currentValue: number;
  totalReturns: number;
  totalReturnsPct: number;
  xirr: number; // e.g. 18.4%
  oneDayChange: number;
  oneDayChangePct: number;
  activeSipAmount: number; // 0 if no active SIP
  purchaseDate: string;
  exitLoadText: string;
}

export type RedemptionStatus = 'SUBMITTED' | 'PROCESSING' | 'COMPLETED';

export interface RedemptionOrder {
  id: string;
  orderNumber: string;
  fundId: string;
  fundName: string;
  unitsRedeemed: number;
  redeemAmount: number;
  nav: number;
  exitLoadPct: number;
  exitLoadDeducted: number;
  netPayout: number;
  bankAccount: string;
  estimatedCreditDate: string;
  status: RedemptionStatus;
  createdAt: string;
}

export type TaxTerm = 'STCG' | 'LTCG';

export interface TaxAuditRecord {
  id: string;
  fundId: string;
  fundName: string;
  fundType: 'EQUITY' | 'DEBT' | 'ELSS';
  units: number;
  buyDate: string;
  sellDate: string;
  buyNav: number;
  sellNav: number;
  buyValue: number;
  sellValue: number;
  holdingDays: number;
  term: TaxTerm;
  gainOrLoss: number;
  applicableRatePct: number;
  taxPayable: number;
  financialYear: string; // e.g. "2024-25"
}

export interface TaxSummary {
  financialYear: string;
  totalRealizedGains: number;
  equityLtcgGross: number;
  equityLtcgExemption: number;
  equityLtcgTaxable: number;
  equityLtcgTax: number; // 12.5% on gains > 1.25L
  equityStcgGross: number;
  equityStcgTax: number; // 20%
  debtGainsGross: number;
  debtGainsTax: number;  // Slab rate (~30%)
  totalEstimatedTax: number;
  unrealizedGains: number;
  elssInvested80C: number;
  elssTaxSaved: number;
}
