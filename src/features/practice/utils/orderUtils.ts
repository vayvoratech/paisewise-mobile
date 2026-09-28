/**
 * Practice order utilities: client order ID generation, charge estimation, and live validations.
 */

export function generateClientOrderId(prefix: string = 'PW-ORD'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
}

export interface OrderValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface EstimatedCharges {
  brokerage: number;
  stt: number;
  exchangeTurnover: number;
  gst: number;
  stampDuty: number;
  totalCharges: number;
  isPracticeZeroFee: boolean;
}

/**
 * Calculates simulated trading charges for Indian equity (NSE delivery/intraday).
 * Shows practice users how charges are computed in real markets, while noting practice zero-fee.
 */
export function estimateTradingCharges(
  totalValue: number,
  mode: 'buy' | 'sell',
  orderType: 'DELIVERY' | 'INTRADAY' = 'DELIVERY'
): EstimatedCharges {
  if (totalValue <= 0) {
    return {
      brokerage: 0,
      stt: 0,
      exchangeTurnover: 0,
      gst: 0,
      stampDuty: 0,
      totalCharges: 0,
      isPracticeZeroFee: true,
    };
  }

  // Real world simulation:
  // Brokerage: ₹0 for delivery or ₹20/order
  const brokerage = 0;
  // STT: 0.1% on Buy & Sell for delivery
  const stt = orderType === 'DELIVERY' ? Math.round(totalValue * 0.001) : mode === 'sell' ? Math.round(totalValue * 0.00025) : 0;
  // Exchange turnover fee: 0.00345%
  const exchangeTurnover = +(totalValue * 0.0000345).toFixed(2);
  // GST: 18% on (brokerage + turnover)
  const gst = +((brokerage + exchangeTurnover) * 0.18).toFixed(2);
  // Stamp duty: 0.015% on buy only
  const stampDuty = mode === 'buy' ? Math.round(totalValue * 0.00015) : 0;

  const totalCharges = +(brokerage + stt + exchangeTurnover + gst + stampDuty).toFixed(2);

  return {
    brokerage,
    stt,
    exchangeTurnover,
    gst,
    stampDuty,
    totalCharges,
    isPracticeZeroFee: true, // In practice mode, waived so user trades with full balance
  };
}

export function validateTradeOrder(params: {
  mode: 'buy' | 'sell';
  qty: number;
  price: number;
  availableCash: number;
  ownedShares: number;
}): OrderValidationResult {
  const { mode, qty, price, availableCash, ownedShares } = params;

  if (qty <= 0) {
    return { isValid: false, error: 'Quantity must be at least 1 share' };
  }

  if (price <= 0) {
    return { isValid: false, error: 'Invalid share price' };
  }

  const totalCost = Math.round(qty * price);

  if (mode === 'buy') {
    if (totalCost > availableCash) {
      const deficit = totalCost - availableCash;
      return {
        isValid: false,
        error: `Insufficient virtual cash. Need ₹${deficit.toLocaleString('en-IN')} more.`,
      };
    }
  } else {
    // Sell mode
    if (ownedShares <= 0) {
      return {
        isValid: false,
        error: "You don't own any shares of this stock in your practice portfolio.",
      };
    }
    if (qty > ownedShares) {
      return {
        isValid: false,
        error: `You only own ${ownedShares} shares. Cannot sell ${qty} shares.`,
      };
    }
  }

  return { isValid: true };
}
