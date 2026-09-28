/** Formatting helpers shared across screens. */

/** Format a number as Indian-grouped rupees, e.g. 104320 -> "₹1,04,320". */
export function formatINR(value: number, withSymbol = true): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(Math.round(value));
  const s = abs.toString();
  let result: string;
  if (s.length <= 3) {
    result = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
  return `${sign}${withSymbol ? '₹' : ''}${result}`;
}

/** Format a percentage with sign, e.g. 4.3 -> "+4.3%". */
export function formatPct(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
