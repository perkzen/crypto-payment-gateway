import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CryptoPay Deployment Module
 *
 * This module deploys the CryptoPay contract with the following configuration:
 * - Platform address: The address that will receive platform fees
 * - Fee basis points: Platform fee in basis points (e.g., 250 = 2.5%)
 *
 * Usage:
 * 1. Update the platform address and fee parameters below
 * 2. Run: npx hardhat ignition deploy ignition/modules/CryptoPay.ts --network <network>
 *
 * Example for local development:
 * npx hardhat ignition deploy ignition/modules/CryptoPay.ts --network localhost
 */

const CryptoPayModule = buildModule('CryptoPayModule', (m) => {
  // Configuration parameters - update these for your deployment
  const platformAddress = m.getParameter(
    'platform',
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  ); // Default to a test address
  const feeBps = m.getParameter('feeBps', 250); // 2.5% default fee

  // Deploy the CryptoPay contract
  const cryptoPay = m.contract('CryptoPay', [platformAddress, feeBps]);

  // Optional: Deploy a mock ERC20 token for testing
  const mockToken = m.contract('MockERC20Permit', ['TestToken', 'TEST']);

  // Optional: Mint some tokens to a test address for testing
  const testAddress = m.getParameter(
    'testAddress',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  ); // Default test address
  const mintAmount = m.getParameter('mintAmount', '1000000000000000000000000'); // 1M tokens with 18 decimals

  m.call(mockToken, 'mint', [testAddress, mintAmount]);

  return {
    cryptoPay,
  };
});

export default CryptoPayModule;
