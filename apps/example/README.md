# Crypto Payment Gateway - Example App

A Next.js example application demonstrating a cryptocurrency payment gateway with checkout UI, wallet connection via RainbowKit/Wagmi, and payment processing flow.

## About This Example

This example app showcases how to integrate the Crypto Payment Gateway SDK into a Next.js application. It provides a user interface for merchants to:

- Create checkout sessions with configurable payment parameters
- Set fiat currency amounts (USD, EUR) and allowed cryptocurrencies (ETH, USDT, USDC)
- Configure payment expiration times and customer information
- Redirect users to a checkout UI where they can connect their wallets and complete payments

The checkout flow integrates with RainbowKit and Wagmi for wallet connectivity, allowing users to connect their Ethereum wallets and process payments through smart contracts.

## Prerequisites

- **Node.js**: Version 20 or higher
- **Package Manager**: pnpm (version 10.18.1 or compatible)
- **Backend API**: The crypto payment gateway API should be running on `http://localhost:8000`
- **Checkout UI**: The checkout UI app should be running (typically on port 3001)

## Environment Setup

Create a `.env.local` file in the `apps/example` directory with the following environment variables:

### Required for Checkout UI

The checkout UI (which opens when users click "Go to Checkout") requires these environment variables. Make sure they are set in `apps/checkout-ui/.env.local`:

```bash
# WalletConnect Project ID (required)
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id

# Smart Contract Address (required)
# Address of the CryptoPay smart contract deployed on your network
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=0x...

# Merchant Address (required)
# Ethereum address where payments should be sent
NEXT_PUBLIC_MERCHANT_ADDRESS=0x...
```

### Optional

The example app itself doesn't require environment variables - you can enter your API key directly in the UI. However, if you want to pre-configure it, you can add:

```bash
# API Key for the Crypto Payment Gateway API (optional)
# Can also be entered in the UI
NEXT_PUBLIC_API_KEY=your_api_key_here
```

## Getting Started

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` files as described in the [Environment Setup](#environment-setup) section above.

**Important**: Make sure the checkout UI app (`apps/checkout-ui`) has its environment variables configured, as users will be redirected there to complete payments.

### 3. Start the Development Server

From the monorepo root:

```bash
pnpm dev
```

Or run the example app directly:

```bash
cd apps/example
pnpm dev
```

The app will be available at [http://localhost:3002](http://localhost:3002).

### 4. Start Required Services

Make sure the following services are running:

- **API Server**: Should be running on `http://localhost:8000`
- **Checkout UI**: Should be running on `http://localhost:3001` (for payment processing)

## Usage

1. **Enter API Key** (optional): If you have an API key, enter it in the "API Key" field. Otherwise, leave it empty if your API doesn't require authentication.

2. **Configure Checkout Session**:
   - Enter the payment amount in cents (e.g., `5000` for $50.00)
   - Select fiat currency (USD or EUR)
   - Choose allowed cryptocurrencies (ETH, USDT, USDC)
   - Select allowed networks (currently Ethereum)
   - Optionally add customer email and expiration time

3. **Create Session**: Click "Create Checkout Session" to generate a checkout session.

4. **Complete Payment**: Click "Go to Checkout" to open the checkout UI in a new tab where users can:
   - Connect their wallet via RainbowKit
   - Review payment details and exchange rates
   - Complete the payment transaction

## RainbowKit/Wagmi Configuration

The checkout UI uses RainbowKit and Wagmi for wallet connectivity. Configuration is handled in `apps/checkout-ui/lib/wagmi.ts`.

### Supported Networks

- **Mainnet**: Ethereum mainnet
- **Sepolia**: Sepolia testnet

### WalletConnect Setup

1. Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Copy your Project ID
3. Add it to `apps/checkout-ui/.env.local` as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

The app will fail fast with a clear error message if the WalletConnect Project ID is missing.

## Project Structure

```
apps/example/
├── app/
│   ├── page.tsx          # Main checkout session creation form
│   ├── success/          # Success page after payment
│   └── cancel/           # Cancel page if payment is cancelled
├── forms/
│   └── checkout-session.ts  # Form configuration and validation
├── hooks/
│   └── use-create-checkout-session.ts  # TanStack Query hook for API calls
└── lib/
    └── crypto-pay-client.ts  # SDK client singleton instance
```

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TanStack Form**: Form state management and validation
- **TanStack Query**: Data fetching and caching
- **@workspace/sdk**: Crypto Payment Gateway SDK
- **@workspace/shared**: Shared types and utilities
- **@workspace/ui**: Shared UI component library

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
