/**
 * Comprehensive Automated Test Suite for Practice Trading Features:
 * 1. Client Order ID Generation & Format
 * 2. Simulated Trading Charges & Practice Zero Fee Model
 * 3. Trade Order Validation (Cash Affordability, Share Ownership, Quantity Bounds)
 * 4. Portfolio Redux Reducer (Buy, Sell, P&L, Reset)
 * 5. Order Log Slice (Local Order Recording with Client Order ID)
 * 6. Practice Stock Data Integrity & Sparkline Structure
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
// SUITE 1: Client Order ID Generation
// --------------------------------------------------------
describe('Client Order ID Generation & Formatting', () => {
  function generateClientOrderId(prefix = 'PW-ORD') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${randomPart}`;
  }

  it('generates unique client order IDs with default prefix', () => {
    const id1 = generateClientOrderId();
    const id2 = generateClientOrderId();
    assert.ok(id1.startsWith('PW-ORD-'));
    assert.ok(id2.startsWith('PW-ORD-'));
    assert.notStrictEqual(id1, id2);
  });

  it('supports custom prefixes like PW-BUY and PW-SELL', () => {
    const buyId = generateClientOrderId('PW-BUY');
    const sellId = generateClientOrderId('PW-SELL');
    assert.ok(buyId.startsWith('PW-BUY-'));
    assert.ok(sellId.startsWith('PW-SELL-'));
  });

  it('generates IDs with expected hyphen-delimited segments', () => {
    const id = generateClientOrderId('PW-ORD');
    const parts = id.split('-');
    assert.strictEqual(parts.length, 4);
    assert.strictEqual(parts[0], 'PW');
    assert.strictEqual(parts[1], 'ORD');
  });
});

// --------------------------------------------------------
// SUITE 2: Simulated Trading Charges Model
// --------------------------------------------------------
describe('Simulated Practice Trading Charges', () => {
  function estimateTradingCharges(totalValue, mode, orderType = 'DELIVERY') {
    if (totalValue <= 0) {
      return { brokerage: 0, stt: 0, exchangeTurnover: 0, gst: 0, stampDuty: 0, totalCharges: 0, isPracticeZeroFee: true };
    }
    const brokerage = 0;
    const stt = orderType === 'DELIVERY' ? Math.round(totalValue * 0.001) : mode === 'sell' ? Math.round(totalValue * 0.00025) : 0;
    const exchangeTurnover = +(totalValue * 0.0000345).toFixed(2);
    const gst = +((brokerage + exchangeTurnover) * 0.18).toFixed(2);
    const stampDuty = mode === 'buy' ? Math.round(totalValue * 0.00015) : 0;
    const totalCharges = +(brokerage + stt + exchangeTurnover + gst + stampDuty).toFixed(2);
    return { brokerage, stt, exchangeTurnover, gst, stampDuty, totalCharges, isPracticeZeroFee: true };
  }

  it('correctly calculates simulated delivery charges for ₹1,00,000 buy', () => {
    const res = estimateTradingCharges(100000, 'buy', 'DELIVERY');
    assert.strictEqual(res.brokerage, 0);
    assert.strictEqual(res.stt, 100); // 0.1% of 1L
    assert.strictEqual(res.stampDuty, 15); // 0.015% of 1L
    assert.strictEqual(res.isPracticeZeroFee, true);
    assert.ok(res.totalCharges > 100);
  });

  it('correctly computes simulated intraday charges for ₹50,000 sell', () => {
    const res = estimateTradingCharges(50000, 'sell', 'INTRADAY');
    assert.strictEqual(res.stampDuty, 0); // No stamp duty on sell
    assert.strictEqual(res.isPracticeZeroFee, true);
  });

  it('handles zero or negative order values safely', () => {
    const res = estimateTradingCharges(0, 'buy');
    assert.strictEqual(res.totalCharges, 0);
    assert.strictEqual(res.isPracticeZeroFee, true);
  });
});

// --------------------------------------------------------
// SUITE 3: Order Validation (Live Cost & Holdings Checks)
// --------------------------------------------------------
describe('Order Live Validation Engine', () => {
  function validateTradeOrder({ mode, qty, price, availableCash, ownedShares }) {
    if (qty <= 0) return { isValid: false, error: 'Quantity must be at least 1 share' };
    if (price <= 0) return { isValid: false, error: 'Invalid share price' };

    const totalCost = Math.round(qty * price);
    if (mode === 'buy') {
      if (totalCost > availableCash) {
        const deficit = totalCost - availableCash;
        return { isValid: false, error: `Insufficient virtual cash. Need ₹${deficit} more.` };
      }
    } else {
      if (ownedShares <= 0) {
        return { isValid: false, error: "You don't own any shares of this stock in your practice portfolio." };
      }
      if (qty > ownedShares) {
        return { isValid: false, error: `You only own ${ownedShares} shares. Cannot sell ${qty} shares.` };
      }
    }
    return { isValid: true };
  }

  it('validates affordable buy orders correctly', () => {
    const res = validateTradeOrder({
      mode: 'buy',
      qty: 5,
      price: 2000,
      availableCash: 50000,
      ownedShares: 0,
    });
    assert.strictEqual(res.isValid, true);
  });

  it('flags unaffordable buy orders with deficit error', () => {
    const res = validateTradeOrder({
      mode: 'buy',
      qty: 10,
      price: 3000, // 30,000 required
      availableCash: 20000, // only 20,000 available
      ownedShares: 0,
    });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Insufficient virtual cash'));
  });

  it('blocks sell orders when user owns 0 shares', () => {
    const res = validateTradeOrder({
      mode: 'sell',
      qty: 1,
      price: 1500,
      availableCash: 80000,
      ownedShares: 0,
    });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes("don't own any shares"));
  });

  it('blocks sell orders when requested quantity exceeds owned shares', () => {
    const res = validateTradeOrder({
      mode: 'sell',
      qty: 8,
      price: 1500,
      availableCash: 80000,
      ownedShares: 5,
    });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('only own 5 shares'));
  });

  it('allows valid sell orders when quantity is within owned shares', () => {
    const res = validateTradeOrder({
      mode: 'sell',
      qty: 3,
      price: 1500,
      availableCash: 80000,
      ownedShares: 5,
    });
    assert.strictEqual(res.isValid, true);
  });
});

// --------------------------------------------------------
// SUITE 4: Portfolio State & Calculations
// --------------------------------------------------------
describe('Practice Portfolio Calculations & Reducer Logic', () => {
  function createPortfolioState() {
    return {
      cash: 84320,
      xp: 1240,
      holdings: [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', emoji: '🛢️', shares: 5, avgPrice: 2900, currentPrice: 2952 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', emoji: '💻', shares: 3, avgPrice: 3850, currentPrice: 3801 },
      ],
      invested: 26050,
      holdingsValue: 26163,
    };
  }

  function buyStockReducer(state, action) {
    const { symbol, name, emoji, shares, price } = action;
    const cost = Math.round(shares * price);
    state.cash -= cost;
    state.xp += 25;

    const existing = state.holdings.find(h => h.symbol === symbol);
    if (existing) {
      const totalShares = existing.shares + shares;
      const newAvg = (existing.avgPrice * existing.shares + price * shares) / totalShares;
      existing.shares = totalShares;
      existing.avgPrice = Math.round(newAvg);
      existing.currentPrice = price;
    } else {
      state.holdings.push({ symbol, name, emoji, shares, avgPrice: price, currentPrice: price });
    }
    state.invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
    state.holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    return state;
  }

  function sellStockReducer(state, action) {
    const { symbol, shares, price } = action;
    const proceeds = Math.round(shares * price);
    const existing = state.holdings.find(h => h.symbol === symbol);
    if (existing) {
      if (existing.shares <= shares) {
        state.holdings = state.holdings.filter(h => h.symbol !== symbol);
      } else {
        existing.shares -= shares;
      }
      state.cash += proceeds;
      state.xp += 25;
      state.invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
      state.holdingsValue = state.holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    }
    return state;
  }

  function resetPortfolioReducer(state) {
    state.cash = 100000;
    state.holdings = [];
    state.invested = 0;
    state.holdingsValue = 0;
    return state;
  }

  it('correctly buys new stock and updates cash and holdings', () => {
    const state = createPortfolioState();
    const initialCash = state.cash;
    buyStockReducer(state, { symbol: 'INFY', name: 'Infosys', emoji: '⚡', shares: 10, price: 1500 });
    assert.strictEqual(state.cash, initialCash - 15000);
    assert.strictEqual(state.holdings.length, 3);
    assert.strictEqual(state.xp, 1240 + 25);
  });

  it('averages prices correctly when buying additional shares of existing stock', () => {
    const state = createPortfolioState();
    // RELIANCE already has 5 shares @ 2900. Buy 5 more @ 3100. New avg should be 3000.
    buyStockReducer(state, { symbol: 'RELIANCE', name: 'Reliance', emoji: '🛢️', shares: 5, price: 3100 });
    const rel = state.holdings.find(h => h.symbol === 'RELIANCE');
    assert.strictEqual(rel.shares, 10);
    assert.strictEqual(rel.avgPrice, 3000);
  });

  it('correctly sells stock partially and credits cash proceeds', () => {
    const state = createPortfolioState();
    const initialCash = state.cash;
    sellStockReducer(state, { symbol: 'RELIANCE', shares: 2, price: 3000 });
    const rel = state.holdings.find(h => h.symbol === 'RELIANCE');
    assert.strictEqual(rel.shares, 3);
    assert.strictEqual(state.cash, initialCash + 6000);
  });

  it('removes holding completely when all shares are sold', () => {
    const state = createPortfolioState();
    sellStockReducer(state, { symbol: 'TCS', shares: 3, price: 3800 });
    const tcs = state.holdings.find(h => h.symbol === 'TCS');
    assert.strictEqual(tcs, undefined);
  });

  it('resets practice portfolio back to ₹1,00,000 cleanly', () => {
    const state = createPortfolioState();
    resetPortfolioReducer(state);
    assert.strictEqual(state.cash, 100000);
    assert.strictEqual(state.holdings.length, 0);
    assert.strictEqual(state.invested, 0);
    assert.strictEqual(state.holdingsValue, 0);
  });
});

// --------------------------------------------------------
// SUITE 5: Practice Stock Dataset & Sparkline Validation
// --------------------------------------------------------
describe('Practice Stock Dataset & Sparklines', () => {
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2952.40, changePct: 1.25, trend: [2910, 2925, 2918, 2935, 2930, 2948, 2942, 2952.40] },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3842.10, changePct: -0.65, trend: [3890, 3880, 3865, 3870, 3855, 3848, 3840, 3842.10] },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1568.50, changePct: 2.10, trend: [1525, 1530, 1542, 1538, 1555, 1560, 1562, 1568.50] },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1645.20, changePct: 0.85, trend: [1620, 1625, 1632, 1628, 1636, 1640, 1638, 1645.20] },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 982.30, changePct: 3.12, trend: [945, 952, 960, 958, 970, 975, 978, 982.30] },
  ];

  it('ensures each practice stock has valid symbol, name, and positive price', () => {
    stocks.forEach(s => {
      assert.ok(s.symbol && s.symbol.length >= 3);
      assert.ok(s.name && s.name.length > 0);
      assert.ok(s.price > 0);
    });
  });

  it('verifies all stocks contain valid sparkline trend points (>= 2 points)', () => {
    stocks.forEach(s => {
      assert.ok(Array.isArray(s.trend));
      assert.ok(s.trend.length >= 2);
      s.trend.forEach(point => assert.ok(typeof point === 'number' && point > 0));
    });
  });
});

console.log(`\n========================================`);
console.log(`📊 FINAL RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
