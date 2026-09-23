import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MFHolding, RedemptionOrder, TaxAuditRecord } from '../mf.types';
import { INITIAL_MF_HOLDINGS, INITIAL_REDEMPTIONS, INITIAL_TAX_RECORDS } from '../mf.data';

interface MFPortfolioState {
  holdings: MFHolding[];
  redemptions: RedemptionOrder[];
  taxRecords: TaxAuditRecord[];
  selectedFinancialYear: string;
}

const initialState: MFPortfolioState = {
  holdings: INITIAL_MF_HOLDINGS,
  redemptions: INITIAL_REDEMPTIONS,
  taxRecords: INITIAL_TAX_RECORDS,
  selectedFinancialYear: '2024-25',
};

export const mfPortfolioSlice = createSlice({
  name: 'mfPortfolio',
  initialState,
  reducers: {
    setSelectedFinancialYear: (state, action: PayloadAction<string>) => {
      state.selectedFinancialYear = action.payload;
    },

    redeemUnits: (
      state,
      action: PayloadAction<{
        holdingId: string;
        units: number;
        bankAccount?: string;
      }>
    ) => {
      const { holdingId, units, bankAccount = 'HDFC Bank •••• 4821' } = action.payload;
      const holding = state.holdings.find((h) => h.id === holdingId);
      if (!holding || units <= 0) return;

      const redeemUnitsCount = Math.min(units, holding.units);
      const grossAmount = Math.round(redeemUnitsCount * holding.currentNav);

      // Check exit load
      let exitLoadPct = 0;
      if (holding.category === 'Debt & Liquid') {
        exitLoadPct = 0;
      } else if (holding.category === 'ELSS Tax Saver') {
        // ELSS 3 year lock-in
        exitLoadPct = 0;
      } else {
        // Generic equity: 1% if holding period < 365 days, nil after
        const purchaseTimestamp = new Date(holding.purchaseDate).getTime();
        const daysHeld = Math.max(1, Math.floor((Date.now() - purchaseTimestamp) / (1000 * 60 * 60 * 24)));
        if (daysHeld < 365) {
          exitLoadPct = 1.0;
        }
      }

      const exitLoadDeducted = Math.round((grossAmount * exitLoadPct) / 100);
      const netPayout = grossAmount - exitLoadDeducted;

      // Create redemption order
      const newOrder: RedemptionOrder = {
        id: `red-${Date.now()}`,
        orderNumber: `RED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fundId: holding.fundId,
        fundName: holding.fundName,
        unitsRedeemed: Number(redeemUnitsCount.toFixed(3)),
        redeemAmount: grossAmount,
        nav: holding.currentNav,
        exitLoadPct,
        exitLoadDeducted,
        netPayout,
        bankAccount,
        estimatedCreditDate: 'Estimated credit within 2 business days (T+2)',
        status: 'COMPLETED',
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.redemptions.unshift(newOrder);

      // Compute Capital Gains & append to TaxAuditRecord
      const buyValue = Math.round(redeemUnitsCount * holding.avgNav);
      const sellValue = grossAmount;
      const gainOrLoss = sellValue - buyValue;

      const purchaseTimestamp = new Date(holding.purchaseDate).getTime();
      const holdingDays = Math.max(1, Math.floor((Date.now() - purchaseTimestamp) / (1000 * 60 * 60 * 24)));
      const isLtcg = holdingDays > 365 && holding.category !== 'Debt & Liquid';
      const term = isLtcg ? 'LTCG' : 'STCG';

      let applicableRatePct = 12.5;
      if (holding.category === 'Debt & Liquid') {
        applicableRatePct = 30.0; // slab rate
      } else if (!isLtcg) {
        applicableRatePct = 20.0; // Budget 2024 STCG
      } else {
        applicableRatePct = 12.5; // Budget 2024 LTCG
      }

      const taxPayable = gainOrLoss > 0 ? Math.round((gainOrLoss * applicableRatePct) / 100) : 0;

      const taxRecord: TaxAuditRecord = {
        id: `tax-${Date.now()}`,
        fundId: holding.fundId,
        fundName: holding.fundName,
        fundType: holding.category === 'Debt & Liquid' ? 'DEBT' : holding.category === 'ELSS Tax Saver' ? 'ELSS' : 'EQUITY',
        units: Number(redeemUnitsCount.toFixed(3)),
        buyDate: holding.purchaseDate,
        sellDate: new Date().toISOString().split('T')[0],
        buyNav: holding.avgNav,
        sellNav: holding.currentNav,
        buyValue,
        sellValue,
        holdingDays,
        term,
        gainOrLoss,
        applicableRatePct,
        taxPayable,
        financialYear: '2024-25',
      };
      state.taxRecords.unshift(taxRecord);

      // Deduct from holding
      if (holding.units <= redeemUnitsCount + 0.001) {
        state.holdings = state.holdings.filter((h) => h.id !== holdingId);
      } else {
        holding.units = Number((holding.units - redeemUnitsCount).toFixed(3));
        holding.investedAmount = Math.round(holding.units * holding.avgNav);
        holding.currentValue = Math.round(holding.units * holding.currentNav);
        holding.totalReturns = holding.currentValue - holding.investedAmount;
        holding.totalReturnsPct = holding.investedAmount > 0 
          ? Number(((holding.totalReturns / holding.investedAmount) * 100).toFixed(2)) 
          : 0;
      }
    },
  },
});

export const { setSelectedFinancialYear, redeemUnits } = mfPortfolioSlice.actions;
export default mfPortfolioSlice.reducer;
