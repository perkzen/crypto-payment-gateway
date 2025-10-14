/**
 * Crypto Payment Gateway SDK Client
 * Core client for interacting with the payment gateway API
 */

export class CryptoPayClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  // TODO: Implement payment methods
  // - createPayment()
  // - getPaymentStatus()
  // - cancelPayment()
  // - getPaymentHistory()
}
