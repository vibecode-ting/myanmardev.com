/**
 * Payment abstraction layer.
 * Routes payment requests to the appropriate handler based on method.
 * Currently only token payments are implemented; others are placeholders.
 */

import { deductTokens } from './auth';
import { createProductOrder } from './orders';
import { getExchangeRate } from './exchange-rate';

// ─── Types ───────────────────────────────────────────────

export type PaymentMethod = 'tokens' | 'crypto' | 'card' | 'bank' | 'mmk_wallet';
export type Currency = 'USD' | 'MMK';

export interface PaymentRequest {
  product: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  userId: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
  transactionId?: string;
}

// ─── Exchange rate (re-export for convenience) ───────────

export const EXCHANGE_RATE = 4000; // 1 USD = 4,000 MMK (fixed)

/**
 * Format a price in both USD and MMK.
 */
export function formatDualPrice(usdAmount: number): string {
  return `$${usdAmount.toFixed(2)} / ${(usdAmount * EXCHANGE_RATE).toLocaleString()} MMK`;
}

/**
 * Convert USD to MMK.
 */
export function convertToMMK(usd: number): number {
  return usd * EXCHANGE_RATE;
}

/**
 * Convert MMK to USD.
 */
export function convertToUSD(mmk: number): number {
  return mmk / EXCHANGE_RATE;
}

// ─── Payment Router ──────────────────────────────────────

/**
 * Process a payment request. Routes to the appropriate handler.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  switch (request.method) {
    case 'tokens':
      return processTokenPayment(request);
    case 'crypto':
      return { success: false, error: 'Crypto payments coming soon' };
    case 'card':
      return { success: false, error: 'Card payments coming soon' };
    case 'bank':
      return { success: false, error: 'Bank transfer coming soon' };
    case 'mmk_wallet':
      return { success: false, error: 'MMK wallet coming soon' };
    default:
      return { success: false, error: 'Unknown payment method' };
  }
}

// ─── Token Payment Handler ───────────────────────────────

/**
 * Process a token-based payment:
 * 1. Deduct tokens from the user's balance
 * 2. Create a product order in Firestore
 * 3. Return success with orderId
 */
async function processTokenPayment(request: PaymentRequest): Promise<PaymentResult> {
  const { product, amount, userId } = request;

  // Deduct tokens from user balance
  const deducted = await deductTokens(userId, amount);
  if (!deducted) {
    return {
      success: false,
      error: 'Insufficient token balance',
    };
  }

  // Create product order in Firestore
  try {
    const orderId = await createProductOrder(
      userId,
      '', // userEmail — not required for order creation
      product as any, // product type (subdomain, website, portfolio)
      amount,
      { product, paymentMethod: 'tokens' }
    );

    return {
      success: true,
      orderId,
      transactionId: `tok_${orderId}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create order',
    };
  }
}
