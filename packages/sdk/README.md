# Crypto Payment Gateway SDK

A TypeScript SDK for integrating with the Crypto Payment Gateway, with built-in React hooks for easy frontend integration.

## Installation

```bash
pnpm add @workspace/sdk
```

## Usage

### Core SDK (Framework-agnostic)

```typescript
import { CryptoPayClient } from '@workspace/sdk/core';

const client = new CryptoPayClient({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
});

// TODO: Implement payment methods
```

### React Hooks

```typescript
import { useCryptoPay, usePaymentStatus } from '@workspace/sdk/react';

function PaymentComponent() {
  const { createPayment, isLoading, error } = useCryptoPay({
    baseUrl: 'https://api.example.com',
    apiKey: 'your-api-key'
  });

  const { payment, status } = usePaymentStatus({
    paymentId: 'payment-id',
    pollInterval: 5000
  });

  // TODO: Implement component logic
}
```

## API Reference

### Core

- `CryptoPayClient` - Main client class for API interactions

### React Hooks

- `useCryptoPay` - Hook for payment operations
- `usePaymentStatus` - Hook for monitoring payment status

### Types

- `PaymentConfig` - Configuration for the SDK
- `PaymentRequest` - Payment creation request
- `PaymentResponse` - Payment response data
- `PaymentStatus` - Payment status enum
- `PaymentError` - Error information

## Development

```bash
# Build the SDK
pnpm build

# Run in development mode
pnpm dev

# Lint
pnpm lint

# Type check
pnpm type-check
```
