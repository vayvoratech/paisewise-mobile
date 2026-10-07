import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinancialGoal, MutualFundInfo, SIPPlan } from '../sip.types';
import { INITIAL_GOALS, INITIAL_SIPS, TOP_MUTUAL_FUNDS } from '../sip.data';

interface SipState {
  funds: MutualFundInfo[];
  activeSips: SIPPlan[];
  goals: FinancialGoal[];
  loading: boolean;
  error: string | null;
}

const initialState: SipState = {
  funds: TOP_MUTUAL_FUNDS,
  activeSips: INITIAL_SIPS,
  goals: INITIAL_GOALS,
  loading: false,
  error: null,
};

export const sipSlice = createSlice({
  name: 'sip',
  initialState,
  reducers: {
    createSIP: (
      state,
      action: PayloadAction<{
        fundId: string;
        amount: number;
        frequency: 'monthly' | 'weekly';
        debitDay: number;
        goalId?: string;
        bankName: string;
        accountLast4: string;
        upiApp: string;
        upiId: string;
      }>
    ) => {
      const { fundId, amount, frequency, debitDay, goalId, bankName, accountLast4, upiApp, upiId } = action.payload;
      const fund = state.funds.find((f) => f.id === fundId);
      const goal = goalId ? state.goals.find((g) => g.id === goalId) : undefined;
      const id = `sip-${Date.now()}`;
      const clientSipId = `SIP-${fund ? fund.amc.slice(0, 4).toUpperCase() : 'MF'}-${Math.floor(10000 + Math.random() * 90000)}`;
      const mandateUrn = `UMRN/${bankName.split(' ')[0].toUpperCase()}/${new Date().getFullYear()}/${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newSip: SIPPlan = {
        id,
        clientSipId,
        fundId,
        fundName: fund ? fund.name : 'Mutual Fund Investment',
        amc: fund ? fund.amc : 'Asset Management Co.',
        category: fund ? fund.category : 'Flexi Cap',
        amount,
        frequency,
        debitDay,
        startDate: new Date().toISOString().split('T')[0],
        nextDebitDate: `${String(debitDay).padStart(2, '0')} Next Month`,
        status: 'ACTIVE',
        goalId,
        goalTitle: goal ? goal.title : undefined,
        mandateUrn,
        bankName,
        accountLast4,
        upiApp,
        upiId,
        totalInstallmentsPaid: 0,
        totalInvested: 0,
      };

      state.activeSips.unshift(newSip);

      // If linked to a goal, register the SIP ID with that goal
      if (goal) {
        if (!goal.linkedSipIds.includes(id)) {
          goal.linkedSipIds.push(id);
        }
      }
    },

    pauseSIP: (state, action: PayloadAction<string>) => {
      const sip = state.activeSips.find((s) => s.id === action.payload);
      if (sip) {
        sip.status = 'PAUSED';
      }
    },

    resumeSIP: (state, action: PayloadAction<string>) => {
      const sip = state.activeSips.find((s) => s.id === action.payload);
      if (sip) {
        sip.status = 'ACTIVE';
      }
    },

    cancelSIP: (state, action: PayloadAction<string>) => {
      const sip = state.activeSips.find((s) => s.id === action.payload);
      if (sip) {
        sip.status = 'CANCELLED';
      }
    },

    addGoal: (
      state,
      action: PayloadAction<{
        title: string;
        emoji: string;
        category: any;
        targetAmount: number;
        initialAmount?: number;
        targetDate: string; // YYYY-MM
        priority?: 'High' | 'Medium' | 'Low';
        expectedReturnRate?: number;
        linkedSipIds?: string[];
      }>
    ) => {
      const {
        title,
        emoji,
        category,
        targetAmount,
        initialAmount = 0,
        targetDate,
        priority = 'Medium',
        expectedReturnRate = 12,
        linkedSipIds = [],
      } = action.payload;

      const newGoal: FinancialGoal = {
        id: `goal-${Date.now()}`,
        title,
        emoji,
        category,
        targetAmount,
        currentAmount: initialAmount,
        targetDate,
        createdDate: new Date().toISOString().split('T')[0],
        priority,
        expectedReturnRate,
        linkedSipIds,
      };

      state.goals.unshift(newGoal);
    },

    updateGoal: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        targetAmount?: number;
        targetDate?: string;
        currentAmount?: number;
      }>
    ) => {
      const goal = state.goals.find((g) => g.id === action.payload.id);
      if (goal) {
        if (action.payload.title !== undefined) goal.title = action.payload.title;
        if (action.payload.targetAmount !== undefined) goal.targetAmount = action.payload.targetAmount;
        if (action.payload.targetDate !== undefined) goal.targetDate = action.payload.targetDate;
        if (action.payload.currentAmount !== undefined) goal.currentAmount = action.payload.currentAmount;
      }
    },

    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
      // Remove goal linkage from SIPs
      state.activeSips.forEach((s) => {
        if (s.goalId === action.payload) {
          s.goalId = undefined;
          s.goalTitle = undefined;
        }
      });
    },

    linkSipToGoal: (state, action: PayloadAction<{ sipId: string; goalId: string }>) => {
      const { sipId, goalId } = action.payload;
      const sip = state.activeSips.find((s) => s.id === sipId);
      const goal = state.goals.find((g) => g.id === goalId);
      if (sip && goal) {
        sip.goalId = goal.id;
        sip.goalTitle = goal.title;
        if (!goal.linkedSipIds.includes(sipId)) {
          goal.linkedSipIds.push(sipId);
        }
      }
    },
  },
});

export const {
  createSIP,
  pauseSIP,
  resumeSIP,
  cancelSIP,
  addGoal,
  updateGoal,
  deleteGoal,
  linkSipToGoal,
} = sipSlice.actions;

export default sipSlice.reducer;
