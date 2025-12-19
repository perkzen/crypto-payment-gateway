/**
 * Contracts exports
 * 
 * This file re-exports the ABI and types from generated contracts
 * without the wagmi hooks to avoid SSR issues.
 */

// Export only the ABI, not the hooks
export { cryptoPayAbi } from './generated';
