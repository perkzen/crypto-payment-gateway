import type { UseAccountReturnType } from 'wagmi';

export function copyToClipboard(text: string) {
  if (typeof navigator === 'undefined') {
    throw new Error('Clipboard API not available');
  }

  return navigator.clipboard.writeText(text);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getBlockExplorerUrl({
  address,
  chain,
}: {
  address: string;
  chain: UseAccountReturnType['chain'];
}) {
  if (chain?.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/address/${address}`;
  }
  // Fallback to etherscan if chain not found or no block explorer
  return `https://etherscan.io/address/${address}`;
}
