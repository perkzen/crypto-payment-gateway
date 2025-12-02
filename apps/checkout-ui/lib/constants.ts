/**
 * Application constants
 * These values come from environment variables and are validated at build time
 */

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `${name} is required but not set. ` +
      `Please set this environment variable in your .env.local file.`
    );
  }
  return value;
}

/**
 * Payment contract address (CryptoPay smart contract)
 */
export const PAYMENT_CONTRACT_ADDRESS = getRequiredEnvVar(
  'NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS',
) as `0x${string}`;

/**
 * Merchant address where payments should be sent
 */
export const MERCHANT_ADDRESS = getRequiredEnvVar(
  'NEXT_PUBLIC_MERCHANT_ADDRESS',
) as `0x${string}`;

/**
 * Ethereum logo URL
 */
export const ETHEREUM_ICON_URL =
  'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040';

