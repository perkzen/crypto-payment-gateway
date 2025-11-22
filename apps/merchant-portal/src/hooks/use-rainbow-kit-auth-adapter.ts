import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { authClient, useSession } from '@/lib/auth-client';
import { createSiweMessage } from 'viem/siwe';

/**
 *  Creates a RainbowKit authentication adapter using SIWE and better-auth.
 *
 */
export function useRainbowKitAuthAdapter() {
  const { address, isConnected, chainId } = useAccount();
  const { refetch: refetchSession } = useSession();

  return createAuthenticationAdapter({
    getNonce: async () => {
      // Wait a bit for wallet connection to be established
      if (!isConnected || !address || !chainId) {
        // Return a promise that will be rejected, but with a clearer error
        throw new Error('Please connect your wallet first');
      }

      const { data: nonceData, error: nonceError } =
        await authClient.siwe.nonce({
          walletAddress: address,
          chainId,
        });

      if (nonceError) {
        throw new Error(
          nonceError.message || 'Could not get nonce from server.',
        );
      }

      if (!nonceData?.nonce) {
        throw new Error('Invalid nonce response from server.');
      }

      return nonceData.nonce;
    },
    createMessage: ({ nonce, address, chainId }) => {
      const domain = window.location.host;
      const uri = window.location.origin;

      return createSiweMessage({
        address: address as `0x${string}`,
        chainId,
        domain,
        uri,
        version: '1',
        statement: 'Sign in with Ethereum.',
        nonce,
      });
    },
    verify: async ({ message, signature }) => {
      if (!isConnected || !address || !chainId) {
        throw new Error('Wallet not connected');
      }

      const { error: verifyError } = await authClient.siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId,
      });

      if (verifyError) {
        return false;
      }

      // Refetch session after successful verification to update auth state
      refetchSession();

      return true;
    },
    signOut: async () => {
      await authClient.signOut();
    },
  });
}
