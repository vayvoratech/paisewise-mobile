/**
 * Historical Portfolio Chart Data Utilities.
 * Computes realistic equity curves for intervals: 1D, 1W, 1M,
 * calibrated to the live virtual portfolio valuation.
 */

export type ChartInterval = '1D' | '1W' | '1M';

export interface ChartDataPoint {
  x: number;
  label: string;
  value: number;
  timeStr: string;
  dateStr?: string;
  diffFromStart?: number;
  diffPctFromStart?: number;
}

export interface PortfolioChartSeries {
  data: ChartDataPoint[];
  startValue: number;
  endValue: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  isPositive: boolean;
  interval: ChartInterval;
}

/**
 * Generates historical performance curves calibrated dynamically
 * to current total portfolio value.
 */
export function generatePortfolioChartData(
  currentPortfolioValue: number,
  interval: ChartInterval
): PortfolioChartSeries {
  const currentValue = Math.max(10_000, Math.round(currentPortfolioValue || 100_000));

  let rawPoints: { label: string; timeStr: string; ratio: number }[] = [];

  switch (interval) {
    case '1D':
      // Intraday trading session (09:15 AM - 03:30 PM)
      rawPoints = [
        { label: '09:15', timeStr: '09:15 AM (Market Open)', ratio: 0.988 },
        { label: '10:00', timeStr: '10:00 AM', ratio: 0.993 },
        { label: '11:00', timeStr: '11:00 AM', ratio: 0.985 },
        { label: '12:00', timeStr: '12:00 PM (Mid-Day)', ratio: 0.992 },
        { label: '13:00', timeStr: '01:00 PM', ratio: 0.997 },
        { label: '14:00', timeStr: '02:00 PM', ratio: 0.994 },
        { label: '15:00', timeStr: '03:00 PM (Power Hour)', ratio: 1.004 },
        { label: '15:30', timeStr: '03:30 PM (Market Close)', ratio: 1.0 },
      ];
      break;

    case '1W':
      // 7-day progression
      rawPoints = [
        { label: 'Mon', timeStr: 'Monday, Session Close', ratio: 0.965 },
        { label: 'Tue', timeStr: 'Tuesday, Session Close', ratio: 0.978 },
        { label: 'Wed', timeStr: 'Wednesday, Session Close', ratio: 0.972 },
        { label: 'Thu', timeStr: 'Thursday, Session Close', ratio: 0.989 },
        { label: 'Fri', timeStr: 'Friday, Session Close', ratio: 0.995 },
        { label: 'Yesterday', timeStr: 'Previous Close', ratio: 0.991 },
        { label: 'Today', timeStr: 'Current Session', ratio: 1.0 },
      ];
      break;

    case '1M':
      // 30-day progression (approx 4 weeks)
      rawPoints = [
        { label: 'Day 1', timeStr: '30 Days Ago', ratio: 0.932 },
        { label: 'Day 5', timeStr: '25 Days Ago', ratio: 0.948 },
        { label: 'Day 10', timeStr: '20 Days Ago', ratio: 0.941 },
        { label: 'Day 15', timeStr: '15 Days Ago (Mid-Month)', ratio: 0.965 },
        { label: 'Day 20', timeStr: '10 Days Ago', ratio: 0.982 },
        { label: 'Day 25', timeStr: '5 Days Ago', ratio: 0.976 },
        { label: 'Day 28', timeStr: '2 Days Ago', ratio: 0.993 },
        { label: 'Today', timeStr: 'Latest Valuation', ratio: 1.0 },
      ];
      break;
  }

  const startRatio = rawPoints[0].ratio;
  const startValue = Math.round(currentValue * startRatio);

  const data: ChartDataPoint[] = rawPoints.map((item, idx) => {
    // If it's the final point, lock exactly to current value
    const val = idx === rawPoints.length - 1 ? currentValue : Math.round(currentValue * item.ratio);
    const diff = val - startValue;
    const diffPct = startValue > 0 ? (diff / startValue) * 100 : 0;

    return {
      x: idx,
      label: item.label,
      timeStr: item.timeStr,
      value: val,
      diffFromStart: diff,
      diffPctFromStart: diffPct,
    };
  });

  const values = data.map((d) => d.value);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const endValue = currentValue;
  const change = endValue - startValue;
  const changePct = startValue > 0 ? (change / startValue) * 100 : 0;
  const isPositive = change >= 0;

  return {
    data,
    startValue,
    endValue,
    high,
    low,
    change,
    changePct,
    isPositive,
    interval,
  };
}
