import { randomBytes } from 'crypto';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey, openAPI, siwe } from 'better-auth/plugins';
import { verifyMessage } from 'viem';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Generates an alphanumeric nonce for SIWE (Sign-In with Ethereum)
 * SIWE specification requires nonces to be alphanumeric (a-z, A-Z, 0-9) only
 */
function generateAlphanumericNonce(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export const getAuthConfig = (database: NodePgDatabase) =>
  betterAuth({
    trustedOrigins: ['http://localhost:3000'],
    plugins: [
      openAPI(),
      apiKey(),
      siwe({
        domain: 'localhost:3000',
        emailDomainName: 'example.com', // optional
        anonymous: false, // optional, default is true, requires to send email in body
        getNonce: async () => generateAlphanumericNonce(32),
        verifyMessage: async ({ message, signature, address }) => {
          try {
            return await verifyMessage({
              address: address as `0x${string}`,
              message,
              signature: signature as `0x${string}`,
            });
          } catch {
            return false;
          }
        },
      }),
    ],

    database: drizzleAdapter(database, { provider: 'pg' }),
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
export const auth = getAuthConfig({} as NodePgDatabase);
