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
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ); // Default to a test address
  const feeBps = m.getParameter('feeBps', 250); // 2.5% default fee

  // Deploy the CryptoPay contract
  const cryptoPay = m.contract('CryptoPay', [platformAddress, feeBps]);

  // Optional: Deploy a mock ERC20 token for testing
  const mockToken = m.contract('MockERC20Permit', ['TestToken', 'TEST']);

  // Optional: Mint some tokens to a test address for testing
  const testAddress = m.getParameter(
    'testAddress',
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ); // Default test address
  const mintAmount = m.getParameter('mintAmount', '1000000000000000000000000'); // 1M tokens with 18 decimals

  m.call(mockToken, 'mint', [testAddress, mintAmount]);

  return {
    cryptoPay,
  };
});

export default CryptoPayModule;
