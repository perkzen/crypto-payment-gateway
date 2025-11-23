import { type SiweVerifyBody } from '@app/modules/auth/hooks/sign-up.hook';
import { InjectDatabaseConnection } from '@app/modules/database/deocrators/inject-database-connection.decoractor';
import { merchant, walletAddress } from '@app/modules/database/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '@app/modules/database/utils/get-database-connection';

@Injectable()
export class SignUpService {
  private readonly logger = new Logger(SignUpService.name);

  constructor(@InjectDatabaseConnection() private readonly db: Database) {}

  async signUp({ walletAddress: address }: SiweVerifyBody) {
    const wallet = await this.db.query.walletAddress.findFirst({
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

    if (!wallet) {
      this.logger.error(`No wallet found for address ${address}`);
      return;
    }

    const { user } = wallet;

    try {
      await this.db
        .insert(merchant)
        .values({
          userId: user.id,
        })
        .onConflictDoNothing({
          target: merchant.userId,
        });

      this.logger.log(`Merchant record exists for user ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to insert merchant for user ${user.id}:`,
        error,
      );
    }
  }
}
