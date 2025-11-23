import { merchants, walletAddress } from '@app/modules/database/schemas';
import { Logger } from '@nestjs/common';
import { createAuthMiddleware } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import type { SIWEVerifyMessageArgs } from '@app/modules/auth/config/auth';
import type { Database } from '@app/modules/database/utils/get-database-connection';

const logger = new Logger('AuthHooks');

/**
 * Handles SIWE verification - ensures a merchant record exists for the user
 */
async function handleSiweVerify(database: Database, body: unknown) {
  const { address } = body as SIWEVerifyMessageArgs;

  const wallet = await database.query.walletAddress.findFirst({
    where: eq(walletAddress.address, address),
    columns: {
      userId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!wallet?.user) {
    // This should not happen if the SIWE verification passed
    logger.warn(`No user found for wallet address ${address}`);
    return;
  }

  const { user } = wallet;

  try {
    await database
      .insert(merchants)
      .values({
        userId: user.id,
        displayName: user.name || 'New Merchant',
      })
      .onConflictDoNothing({
        target: merchants.userId,
      });

    logger.log(`Ensured merchant record exists for user ${user.id}`);
  } catch (error) {
    logger.error(`Failed to ensure merchant for user ${user.id}:`, error);
  }
}

export const authHooks = (database: Database) => ({
  after: createAuthMiddleware(async (ctx) => {
    const { path, body } = ctx;

    switch (path) {
      case '/siwe/verify':
        return handleSiweVerify(database, body);
    }
  }),
});
