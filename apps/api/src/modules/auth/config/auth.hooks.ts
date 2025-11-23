import { merchants, walletAddress } from '@app/modules/database/schemas';
import { Logger } from '@nestjs/common';
import { createAuthMiddleware } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '@app/modules/database/utils/get-database-connection';

const logger = new Logger('AuthHooks');

const siweVeirfyPayloadSchema = z.object({
  walletAddress: z.string(),
  message: z.string(),
  chainId: z.number(),
  signature: z.string(),
});

/**
 * Handles SIWE verification - ensures a merchant record exists for the user
 */
async function handleSiweVerify(database: Database, body: unknown) {
  const parsedBody = siweVeirfyPayloadSchema.safeParse(body);

  if (!parsedBody.success) {
    logger.warn(`Invalid SIWE verify payload: ${JSON.stringify(body)}`);
    return;
  }

  const { walletAddress: address } = parsedBody.data;

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
    logger.warn(`No user found for wallet address ${JSON.stringify(body)}`);
    return;
  }

  const { user } = wallet;

  try {
    await database
      .insert(merchants)
      .values({
        userId: user.id,
      })
      .onConflictDoNothing({
        target: merchants.userId,
      });

    logger.log(`Merchant record exists for user ${user.id}`);
  } catch (error) {
    logger.error(`Failed to insert merchant for user ${user.id}:`, error);
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
