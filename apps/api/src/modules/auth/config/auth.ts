import { authHooks } from '@app/modules/auth/config/auth.hooks';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { generateRandomString } from 'better-auth/crypto';
import {
  type SIWEPluginOptions,
  apiKey,
  openAPI,
  siwe,
} from 'better-auth/plugins';
import { type VerifyMessageParameters, verifyMessage } from 'viem';
import type { Database } from '@app/modules/database/utils/get-database-connection';

export type SIWEVerifyMessageArgs = Parameters<
  SIWEPluginOptions['verifyMessage']
>[0];

export const getAuthConfig = (database: Database) =>
  betterAuth({
    trustedOrigins: ['http://localhost:3000'],
    plugins: [
      openAPI(),
      apiKey({
        requireName: true,
        defaultPrefix: 'cpg-',
        minimumNameLength: 3,
        startingCharactersConfig: {
          charactersLength: 10,
          shouldStore: true,
        },
      }),
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
    hooks: authHooks(database),
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
export const auth = getAuthConfig({} as Database);
