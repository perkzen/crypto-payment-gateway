/**
 * Masks a wallet address for logging purposes to comply with PII policy.
 * Returns first 6 and last 4 characters: 0x1234...5678
 */
export function maskWalletAddress(address: string): string {
  if (address.length <= 10) {
    return '0x****';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
