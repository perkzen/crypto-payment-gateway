/**
 * TypeScript type definitions for the Crypto Payment Gateway SDK
 */

export interface PaymentConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface PaymentRequest {
  amount: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
