/**
 * Crypto Payment Gateway SDK Client
 * Core client for interacting with the payment gateway API
 */

import {
  type CreateCheckoutSession,
  type CreateCheckoutSessionResult,
  CreateCheckoutSessionResultSchema,
  type ExchangeRate,
  ExchangeRateSchema,
  type PublicCheckoutSession,
  PublicCheckoutSessionSchema,
} from '@workspace/shared';
import axios, { type AxiosError, type AxiosInstance } from 'axios';

export class CryptoPayClient {
  private axiosInstance: AxiosInstance;
  private static readonly BASE_URL = 'http://localhost:8000';

  constructor(config: { apiKey?: string }) {
    this.axiosInstance = axios.create({
      baseURL: CryptoPayClient.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'x-api-key': config.apiKey }),
      },
    });
  }

  /**
   * Handle axios errors and convert them to user-friendly Error messages
   */
  private handleError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        `${defaultMessage}: ${axiosError.response?.statusText || 'Unknown error'}`;
      throw new Error(errorMessage);
    }
    throw error;
  }

  /**
   * Create a new checkout session
   * @param data - Checkout session creation data
   * @returns Promise resolving to the created checkout session
   * @throws Error if the API request fails
   */
  async createCheckoutSession(
    data: CreateCheckoutSession,
  ): Promise<CreateCheckoutSessionResult> {
    try {
      const response =
        await this.axiosInstance.post<CreateCheckoutSessionResult>(
          '/checkout/sessions',
          data,
        );

      return CreateCheckoutSessionResultSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to create checkout session');
    }
  }

  /**
   * Get a checkout session by ID
   * @param id - The checkout session ID
   * @returns Promise resolving to the checkout session
   * @throws Error if the API request fails
   */
  async getCheckoutSessionById(id: string): Promise<PublicCheckoutSession> {
    try {
      const response = await this.axiosInstance.get<PublicCheckoutSession>(
        `/checkout/sessions/${id}`,
      );

      return PublicCheckoutSessionSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to get checkout session');
    }
  }

  /**
   * Get exchange rate for a crypto/fiat pair
   * @param crypto - Cryptocurrency ticker (e.g., 'ETH')
   * @param fiat - Fiat currency ticker (e.g., 'USD', 'EUR')
   * @returns Promise resolving to the exchange rate
   * @throws Error if the API request fails
   */
  async getExchangeRate(crypto: string, fiat: string): Promise<ExchangeRate> {
    try {
      const response = await this.axiosInstance.get<ExchangeRate>(
        '/exchange/price',
        {
          params: {
            pair: `${crypto},${fiat}`,
          },
        },
      );

      return ExchangeRateSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to get exchange rate');
    }
  }
}
