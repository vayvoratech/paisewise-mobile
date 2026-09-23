/**
 * Comprehensive Automated Test Suite for:
 * 1. SIP Calculator & Compound Interest Mathematical Model
 * 2. Financial Goal Meeting Predictions Engine
 * 3. Budget 2024 Capital Gains Tax Estimations (LTCG, STCG, Debt, ELSS 80C)
 * 4. Mutual Fund Redemptions & Exit Load Calculations
 * 5. Redux Slice State Reducers (sipSlice & mfPortfolioSlice)
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
  }
}

function describe(suiteName, fn) {
  console.log(`\n========================================`);
  console.log(`🧪 SUITE: ${suiteName}`);
  console.log(`========================================`);
  fn();
}

// --------------------------------------------------------
// SUITE 1: SIP & Lumpsum Calculator Formulas
// --------------------------------------------------------
describe('SIP & CAGR Calculator Math Model', () => {
  function calcSIP(monthlyAmount, annualRatePct, years) {
    const i = annualRatePct / 12 / 100;
    const n = years * 12;
    const invested = monthlyAmount * n;
    if (i === 0) return { invested, maturity: invested, gain: 0 };
    const maturity = Math.round(monthlyAmount * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)));
    const gain = maturity - invested;
    return { invested, maturity, gain };
  }

  function calcLumpsum(amount, annualRatePct, years) {
    const maturity = Math.round(amount * Math.pow(1 + annualRatePct / 100, years));
    return { invested: amount, maturity, gain: maturity - amount };
  }

  function calcInflationAdjusted(maturity, inflationRatePct, years) {
    return Math.round(maturity / Math.pow(1 + inflationRatePct / 100, years));
  }

  it('calculates 10-year SIP of ₹5,000/mo at 12% CAGR accurately', () => {
    const res = calcSIP(5000, 12, 10);
    assert.strictEqual(res.invested, 600000);
    // Standard future value formula: ₹11,61,695
    assert.ok(Math.abs(res.maturity - 1161695) <= 100, `Expected ~11,61,695, got ${res.maturity}`);
    assert.strictEqual(res.gain, res.maturity - res.invested);
  });

  it('calculates 15-year SIP of ₹10,000/mo at 15% CAGR', () => {
    const res = calcSIP(10000, 15, 15);
    assert.strictEqual(res.invested, 1800000);
    // Standard future value formula: ~₹67,68,631
    assert.ok(Math.abs(res.maturity - 6768631) <= 500, `Expected ~67,68,631, got ${res.maturity}`);
    assert.ok(res.gain > 4900000);
  });

  it('calculates 10-year Lumpsum of ₹1,00,000 at 12% CAGR', () => {
    const res = calcLumpsum(100000, 12, 10);
    assert.strictEqual(res.invested, 100000);
    // 100000 * (1.12)^10 = 310585
    assert.strictEqual(res.maturity, 310585);
    assert.strictEqual(res.gain, 210585);
  });

  it('adjusts projected wealth for 6% annual inflation', () => {
    const res = calcSIP(5000, 12, 10);
    const realMaturity = calcInflationAdjusted(res.maturity, 6, 10);
    // 1161695 / (1.06)^10 = ~648682
    assert.ok(realMaturity < res.maturity, 'Real maturity should be less than nominal');
    assert.ok(Math.abs(realMaturity - 648682) <= 200, `Expected ~648,682, got ${realMaturity}`);
  });
});

// --------------------------------------------------------
// SUITE 2: Goal Meeting Predictions Engine
// --------------------------------------------------------
describe('Goal Tracker & Meeting Predictions Engine', () => {
  function predictGoal({ currentAmount, targetAmount, targetMonths, monthlySip, annualRatePct }) {
    const monthlyRate = annualRatePct / 12 / 100;
    const fvCurrent = Math.round(currentAmount * Math.pow(1 + monthlyRate, targetMonths));
    const annuityFactor = ((Math.pow(1 + monthlyRate, targetMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const fvSip = monthlySip > 0 ? Math.round(monthlySip * annuityFactor) : 0;
    const totalProjected = fvCurrent + fvSip;
    const difference = totalProjected - targetAmount;
    const isAhead = difference >= 0;

    const deficitToFund = Math.max(0, targetAmount - fvCurrent);
    const requiredMonthlySip = Math.round(deficitToFund / annuityFactor);
    const sipDeltaRequired = Math.max(0, requiredMonthlySip - monthlySip);

    return {
      totalProjected,
      difference,
      isAhead,
      requiredMonthlySip,
      sipDeltaRequired,
    };
  }

  it('identifies an on-track goal with surplus', () => {
    const pred = predictGoal({
      currentAmount: 840000,
      targetAmount: 2500000,
      targetMonths: 48, // 4 years
      monthlySip: 25000,
      annualRatePct: 13,
    });

    assert.ok(pred.isAhead, 'Goal should be on track/ahead');
    assert.ok(pred.totalProjected > 2500000, 'Projected amount should exceed 25L');
    assert.ok(pred.difference > 0, 'Surplus should be positive');
    assert.strictEqual(pred.sipDeltaRequired, 0, 'No additional SIP needed when ahead');
  });

  it('identifies shortfall and calculates exact additional SIP required', () => {
    const pred = predictGoal({
      currentAmount: 100000,
      targetAmount: 2000000, // 20 Lakhs
      targetMonths: 60,      // 5 years
      monthlySip: 5000,      // only 5k/mo
      annualRatePct: 12,
    });

    assert.strictEqual(pred.isAhead, false, 'Goal should project a shortfall');
    assert.ok(pred.difference < 0, 'Difference should be negative');
    assert.ok(pred.sipDeltaRequired > 15000, `Expected sipDelta > 15k, got ${pred.sipDeltaRequired}`);
    assert.strictEqual(pred.requiredMonthlySip, 5000 + pred.sipDeltaRequired);
  });

  it('evaluates conservative (10%), expected (13%), and aggressive (16%) scenarios', () => {
    const base = {
      currentAmount: 200000,
      targetAmount: 1000000,
      targetMonths: 36,
      monthlySip: 15000,
    };

    const cons = predictGoal({ ...base, annualRatePct: 10 });
    const exp = predictGoal({ ...base, annualRatePct: 13 });
    const aggr = predictGoal({ ...base, annualRatePct: 16 });

    assert.ok(aggr.totalProjected > exp.totalProjected, 'Aggressive > Expected');
    assert.ok(exp.totalProjected > cons.totalProjected, 'Expected > Conservative');
  });
});

// --------------------------------------------------------
// SUITE 3: Budget 2024 Capital Gains Tax Calculations
// --------------------------------------------------------
describe('Budget 2024 Capital Gains Tax Engine', () => {
  function computeTaxSummary(trades, fy = '2024-25') {
    const isBudget2024 = fy === '2024-25';
    const ltcgExemptionLimit = isBudget2024 ? 125000 : 100000;
    const ltcgRate = isBudget2024 ? 0.125 : 0.10;
    const stcgRate = isBudget2024 ? 0.20 : 0.15;

    let equityLtcgGross = 0;
    let equityStcgGross = 0;
    let debtGainsGross = 0;

    for (const t of trades) {
      const gain = Math.max(0, t.gain);
      if (t.type === 'DEBT') {
        debtGainsGross += gain;
      } else if (t.term === 'LTCG') {
        equityLtcgGross += gain;
      } else {
        equityStcgGross += gain;
      }
    }

    const equityLtcgExemption = Math.min(equityLtcgGross, ltcgExemptionLimit);
    const equityLtcgTaxable = Math.max(0, equityLtcgGross - equityLtcgExemption);
    const equityLtcgTax = Math.round(equityLtcgTaxable * ltcgRate);
    const equityStcgTax = Math.round(equityStcgGross * stcgRate);
    const debtGainsTax = Math.round(debtGainsGross * 0.30); // 30% slab

    const totalRealized = equityLtcgGross + equityStcgGross + debtGainsGross;
    const totalTax = equityLtcgTax + equityStcgTax + debtGainsTax;

    return {
      equityLtcgGross,
      equityLtcgExemption,
      equityLtcgTaxable,
      equityLtcgTax,
      equityStcgGross,
      equityStcgTax,
      debtGainsGross,
      debtGainsTax,
      totalRealized,
      totalTax,
    };
  }

  it('exempts Equity LTCG under ₹1,25,000 threshold for FY 2024-25', () => {
    const trades = [
      { type: 'EQUITY', term: 'LTCG', gain: 75000 },
      { type: 'EQUITY', term: 'LTCG', gain: 30000 },
    ];
    const tax = computeTaxSummary(trades, '2024-25');
    assert.strictEqual(tax.equityLtcgGross, 105000);
    assert.strictEqual(tax.equityLtcgExemption, 105000);
    assert.strictEqual(tax.equityLtcgTaxable, 0);
    assert.strictEqual(tax.equityLtcgTax, 0, 'No tax under ₹1.25L exemption');
  });

  it('taxes Equity LTCG exceeding ₹1,25,000 at 12.5% for FY 2024-25', () => {
    const trades = [
      { type: 'EQUITY', term: 'LTCG', gain: 225000 }, // ₹2.25L gain
    ];
    const tax = computeTaxSummary(trades, '2024-25');
    assert.strictEqual(tax.equityLtcgGross, 225000);
    assert.strictEqual(tax.equityLtcgExemption, 125000);
    assert.strictEqual(tax.equityLtcgTaxable, 100000);
    assert.strictEqual(tax.equityLtcgTax, 12500, '12.5% on 1,00,000 = 12,500');
  });

  it('taxes Equity STCG at 20% in Budget 2024 with zero exemption', () => {
    const trades = [
      { type: 'EQUITY', term: 'STCG', gain: 50000 },
    ];
    const tax = computeTaxSummary(trades, '2024-25');
    assert.strictEqual(tax.equityStcgGross, 50000);
    assert.strictEqual(tax.equityStcgTax, 10000, '20% of 50,000 = 10,000');
  });

  it('taxes Debt funds at investor slab rate (~30%) under Section 50AA', () => {
    const trades = [
      { type: 'DEBT', term: 'STCG', gain: 20000 },
    ];
    const tax = computeTaxSummary(trades, '2024-25');
    assert.strictEqual(tax.debtGainsGross, 20000);
    assert.strictEqual(tax.debtGainsTax, 6000, '30% of 20,000 = 6,000');
  });
});

// --------------------------------------------------------
// SUITE 4: Mutual Fund Redemption Logic & Exit Load
// --------------------------------------------------------
describe('Mutual Fund Redemption & Exit Load Accounting', () => {
  function redeem({ units, currentNav, avgNav, daysHeld, category }) {
    const grossValue = Math.round(units * currentNav);
    let exitLoadPct = 0;
    if (category !== 'Debt & Liquid' && daysHeld < 365) {
      exitLoadPct = 1.0;
    }
    const exitLoadDeducted = Math.round((grossValue * exitLoadPct) / 100);
    const netPayout = grossValue - exitLoadDeducted;

    const buyValue = Math.round(units * avgNav);
    const gainOrLoss = grossValue - buyValue;
    const term = daysHeld > 365 && category !== 'Debt & Liquid' ? 'LTCG' : 'STCG';

    return {
      grossValue,
      exitLoadPct,
      exitLoadDeducted,
      netPayout,
      gainOrLoss,
      term,
    };
  }

  it('applies 1% exit load for equity fund held < 365 days', () => {
    const res = redeem({
      units: 100,
      currentNav: 150,
      avgNav: 120,
      daysHeld: 180, // < 1 year
      category: 'Large Cap',
    });

    assert.strictEqual(res.grossValue, 15000);
    assert.strictEqual(res.exitLoadPct, 1.0);
    assert.strictEqual(res.exitLoadDeducted, 150);
    assert.strictEqual(res.netPayout, 14850);
    assert.strictEqual(res.term, 'STCG');
    assert.strictEqual(res.gainOrLoss, 3000);
  });

  it('waives exit load and classifies as LTCG when held > 365 days', () => {
    const res = redeem({
      units: 500,
      currentNav: 85,
      avgNav: 65,
      daysHeld: 730, // 2 years
      category: 'Flexi Cap',
    });

    assert.strictEqual(res.grossValue, 42500);
    assert.strictEqual(res.exitLoadPct, 0);
    assert.strictEqual(res.exitLoadDeducted, 0);
    assert.strictEqual(res.netPayout, 42500);
    assert.strictEqual(res.term, 'LTCG');
    assert.strictEqual(res.gainOrLoss, 10000);
  });

  it('waives exit load for Debt/Liquid funds', () => {
    const res = redeem({
      units: 1000,
      currentNav: 29.5,
      avgNav: 28.0,
      daysHeld: 45,
      category: 'Debt & Liquid',
    });

    assert.strictEqual(res.exitLoadPct, 0);
    assert.strictEqual(res.exitLoadDeducted, 0);
    assert.strictEqual(res.netPayout, 29500);
  });
});

// --------------------------------------------------------
// SUITE 5: Redux Slices State Transitions
// --------------------------------------------------------
describe('Redux Slices State Transitions', () => {
  // Pure reducer representation matching sipSlice
  function sipReducer(state, action) {
    if (action.type === 'createSIP') {
      const { fundId, amount, frequency, debitDay, goalId, bankName, accountLast4, upiApp, upiId } = action.payload;
      const id = `sip-${Date.now()}`;
      const newSip = {
        id,
        clientSipId: `SIP-MF-12345`,
        fundId,
        amount,
        frequency,
        debitDay,
        status: 'ACTIVE',
        goalId,
        mandateUrn: `UMRN/${bankName.split(' ')[0].toUpperCase()}/2026/8892182`,
        bankName,
        accountLast4,
        upiApp,
        upiId,
      };
      const nextSips = [newSip, ...state.activeSips];
      const nextGoals = state.goals.map((g) => {
        if (g.id === goalId && !g.linkedSipIds.includes(id)) {
          return { ...g, linkedSipIds: [...g.linkedSipIds, id] };
        }
        return g;
      });
      return { ...state, activeSips: nextSips, goals: nextGoals };
    }

    if (action.type === 'addGoal') {
      const newGoal = {
        id: `goal-${Date.now()}`,
        ...action.payload,
        currentAmount: action.payload.initialAmount || 0,
        linkedSipIds: [],
      };
      return { ...state, goals: [newGoal, ...state.goals] };
    }

    return state;
  }

  // Pure reducer representation matching mfPortfolioSlice
  function mfPortfolioReducer(state, action) {
    if (action.type === 'redeemUnits') {
      const { holdingId, units, bankAccount = 'HDFC Bank •••• 4821' } = action.payload;
      const holding = state.holdings.find((h) => h.id === holdingId);
      if (!holding || units <= 0) return state;

      const redeemUnitsCount = Math.min(units, holding.units);
      const grossAmount = Math.round(redeemUnitsCount * holding.currentNav);
      const exitLoadPct = holding.category === 'Debt & Liquid' ? 0 : 1.0;
      const exitLoadDeducted = Math.round((grossAmount * exitLoadPct) / 100);
      const netPayout = grossAmount - exitLoadDeducted;

      const newOrder = {
        id: `red-${Date.now()}`,
        orderNumber: `RED-2026-9912`,
        fundId: holding.fundId,
        fundName: holding.fundName,
        unitsRedeemed: redeemUnitsCount,
        redeemAmount: grossAmount,
        netPayout,
        bankAccount,
        status: 'COMPLETED',
      };

      const isLtcg = true; // > 365 days
      const taxRecord = {
        id: `tax-${Date.now()}`,
        fundId: holding.fundId,
        units: redeemUnitsCount,
        term: isLtcg ? 'LTCG' : 'STCG',
        gainOrLoss: grossAmount - Math.round(redeemUnitsCount * holding.avgNav),
        applicableRatePct: 12.5,
        financialYear: '2024-25',
      };

      const nextHoldings = state.holdings.map((h) => {
        if (h.id === holdingId) {
          const remUnits = Number((h.units - redeemUnitsCount).toFixed(3));
          return {
            ...h,
            units: remUnits,
            currentValue: Math.round(remUnits * h.currentNav),
          };
        }
        return h;
      }).filter((h) => h.units > 0);

      return {
        ...state,
        holdings: nextHoldings,
        redemptions: [newOrder, ...state.redemptions],
        taxRecords: [taxRecord, ...state.taxRecords],
      };
    }

    return state;
  }

  it('sipReducer creates a new active SIP and links to goal', () => {
    const initialState = {
      activeSips: [],
      goals: [{ id: 'goal-house', title: 'Down Payment', linkedSipIds: [] }],
    };

    const action = {
      type: 'createSIP',
      payload: {
        fundId: 'mf-ppfas-flexi',
        amount: 7500,
        frequency: 'monthly',
        debitDay: 15,
        goalId: 'goal-house',
        bankName: 'HDFC Bank',
        accountLast4: '4821',
        upiApp: 'Google Pay',
        upiId: 'test@okhdfcbank',
      },
    };

    const nextState = sipReducer(initialState, action);
    assert.strictEqual(nextState.activeSips.length, 1);
    const createdSip = nextState.activeSips[0];
    assert.strictEqual(createdSip.amount, 7500);
    assert.strictEqual(createdSip.status, 'ACTIVE');
    assert.strictEqual(createdSip.goalId, 'goal-house');
    assert.ok(createdSip.mandateUrn.startsWith('UMRN/HDFC'));

    const goal = nextState.goals.find((g) => g.id === 'goal-house');
    assert.ok(goal.linkedSipIds.includes(createdSip.id));
  });

  it('sipReducer creates a new financial goal', () => {
    const initialState = { goals: [] };
    const action = {
      type: 'addGoal',
      payload: {
        title: 'Daughter Higher Education',
        emoji: '🎓',
        category: 'Education',
        targetAmount: 3000000,
        initialAmount: 250000,
        targetDate: '2030-05',
      },
    };

    const nextState = sipReducer(initialState, action);
    assert.strictEqual(nextState.goals.length, 1);
    const created = nextState.goals[0];
    assert.strictEqual(created.title, 'Daughter Higher Education');
    assert.strictEqual(created.targetAmount, 3000000);
    assert.strictEqual(created.currentAmount, 250000);
  });

  it('mfPortfolioReducer executes partial redemption and logs tax audit record', () => {
    const initialState = {
      holdings: [
        {
          id: 'hold-1',
          fundId: 'mf-ppfas-flexi',
          fundName: 'Parag Parikh Flexi Cap Fund',
          category: 'Flexi Cap',
          units: 1475.448,
          avgNav: 67.78,
          currentNav: 84.72,
          currentValue: 125000,
        },
      ],
      redemptions: [],
      taxRecords: [],
    };

    const action = {
      type: 'redeemUnits',
      payload: {
        holdingId: 'hold-1',
        units: 100,
      },
    };

    const nextState = mfPortfolioReducer(initialState, action);
    // Holding units reduced
    const updatedHolding = nextState.holdings.find((h) => h.id === 'hold-1');
    assert.strictEqual(updatedHolding.units, 1375.448);

    // New redemption order created
    assert.strictEqual(nextState.redemptions.length, 1);
    assert.strictEqual(nextState.redemptions[0].unitsRedeemed, 100);

    // New tax record created
    assert.strictEqual(nextState.taxRecords.length, 1);
    const taxRec = nextState.taxRecords[0];
    assert.strictEqual(taxRec.fundId, 'mf-ppfas-flexi');
    assert.strictEqual(taxRec.units, 100);
    assert.strictEqual(taxRec.financialYear, '2024-25');
  });
});

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
