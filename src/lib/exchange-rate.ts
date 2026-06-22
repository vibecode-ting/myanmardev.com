/**
 * Exchange rate utility for USD <-> MMK conversion.
 * Fixed rate: 1 USD = 4,000 MMK (as per project spec).
 */

const DEFAULT_RATE = 4000; // 1 USD = 4,000 MMK (fixed)

/**
 * Get the current exchange rate (fixed).
 */
export function getExchangeRate(): number {
  return DEFAULT_RATE;
}

/**
 * Format a USD amount as a string (e.g. "$4.00").
 */
export function formatUSD(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

/**
 * Format a MMK amount as a string (e.g. "16,000 MMK").
 */
export function formatMMK(mmk: number): string {
  return `${mmk.toLocaleString()} MMK`;
}

/**
 * Format a USD amount in both USD and MMK (e.g. "$4.00 / 16,000 MMK").
 */
export function formatDual(usd: number): string {
  return `${formatUSD(usd)} / ${formatMMK(usd * DEFAULT_RATE)}`;
}
