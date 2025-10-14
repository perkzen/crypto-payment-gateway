import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey, openAPI, siwe } from 'better-auth/plugins';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Configuration function for runtime use
export const getAuthConfig = (database: NodePgDatabase) =>
  betterAuth({
    plugins: [
      openAPI(),
      apiKey(),
      siwe({
        domain: 'example.com',
        emailDomainName: 'example.com', // optional
        anonymous: false, // optional, default is true
        getNonce: async () => {
          // Implement your nonce generation logic here
          return 'your-secure-random-nonce';
        },
        verifyMessage: async (args) => {
          // Implement your SIWE message verification logic here
          // This should verify the signature against the message
          return true; // return true if signature is valid
        },
        ensLookup: async (args) => {
          // Optional: Implement ENS lookup for user names and avatars
          return {
            name: 'user.eth',
            avatar: 'https://example.com/avatar.png',
          };
        },
      }),
    ],

    database: drizzleAdapter(database, { provider: 'pg' }),
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
export const auth = getAuthConfig({} as NodePgDatabase);
