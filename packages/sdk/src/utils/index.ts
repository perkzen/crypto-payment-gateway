/**
 * Utility functions for the Crypto Payment Gateway SDK
 */

/**
 * Validates a payment amount
 */
export function validateAmount(amount: string): boolean {
  // TODO: Implement amount validation
  return true;
}

/**
 * Formats currency amount
 */
export function formatCurrency(amount: string, currency: string): string {
  // TODO: Implement currency formatting
  return `${amount} ${currency}`;
}

/**
 * Generates a unique payment ID
 */
export function generatePaymentId(): string {
  // TODO: Implement payment ID generation
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}