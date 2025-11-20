import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { generateRandomString } from 'better-auth/crypto';
import { apiKey, openAPI, siwe } from 'better-auth/plugins';
import { type VerifyMessageParameters, verifyMessage } from 'viem';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const getAuthConfig = (database: NodePgDatabase) =>
  betterAuth({
    trustedOrigins: ['http://localhost:3000'],
    plugins: [
      openAPI(),
      apiKey(),
      siwe({
        domain: 'localhost:3000',
        emailDomainName: 'example.com', // optional
        anonymous: true, // optional, default is true, requires to send email in body
        getNonce: async () => generateRandomString(32, 'a-z', 'A-Z', '0-9'),
        verifyMessage: async ({ message, signature, address }) => {
          try {
            return await verifyMessage({
              address,
              message,
              signature,
            } as VerifyMessageParameters);
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
