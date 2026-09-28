export type FundCategory = 
  | 'Flexi Cap' 
  | 'Large Cap' 
  | 'Mid Cap' 
  | 'Small Cap' 
  | 'Debt & Liquid' 
  | 'ELSS Tax Saver';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface MutualFundInfo {
  id: string;
  name: string;
  amc: string;
  category: FundCategory;
  nav: number;
  navDate: string;
  cagr3Y: number;
  cagr5Y: number;
  minSip: number;
  rating: number; // 1-5 stars
  aum: string;    // e.g. "₹48,250 Cr"
  expenseRatio: number; // e.g. 0.65%
  risk: RiskLevel;
  icon: string;
}

export type SIPFrequency = 'monthly' | 'weekly';

export type SIPStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface SIPPlan {
  id: string;
  clientSipId: string;
  fundId: string;
  fundName: string;
  amc: string;
  category: FundCategory;
  amount: number;
  frequency: SIPFrequency;
  debitDay: number; // e.g. 5 for 5th of month
  startDate: string;
  nextDebitDate: string;
  status: SIPStatus;
  goalId?: string;
  goalTitle?: string;
  mandateUrn: string;
  bankName: string;
  accountLast4: string;
  upiApp: string;
  upiId: string;
  totalInstallmentsPaid: number;
  totalInvested: number;
}

export type GoalCategory = 
  | 'House' 
  | 'Retirement' 
  | 'Education' 
  | 'Emergency' 
  | 'Car' 
  | 'Vacation' 
  | 'Wealth';

export interface FinancialGoal {
  id: string;
  title: string;
  emoji: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // "YYYY-MM"
  createdDate: string;
  priority: 'High' | 'Medium' | 'Low';
  expectedReturnRate: number; // e.g. 12%
  linkedSipIds: string[];
}

export interface GoalMeetingPrediction {
  goalId: string;
  isFeasible: boolean;
  projectedAmountAtTarget: number;
  projectedCompletionDate: string; // "YYYY-MM"
  monthsAheadOrBehind: number; // positive = ahead, negative = behind
  shortfallOrSurplus: number;
  requiredMonthlySip: number;
  currentMonthlySip: number;
  sipDeltaRequired: number; // additional SIP needed to reach on time
  probabilityPct: number;
  scenarioConservative: number; // at 10%
  scenarioExpected: number;     // at 13%
  scenarioAggressive: number;   // at 16%
}

export interface UpiMandateConfig {
  upiApp: string;
  upiId: string;
  bankName: string;
  accountLast4: string;
  maxLimit: number;
  frequency: string;
}
