import { type SiweVerifyBody } from '@app/modules/auth/hooks/sign-up.hook';
import { DatabaseService } from '@app/modules/database/database.service';
import { merchant, walletAddress } from '@app/modules/database/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class SignUpService {
  private readonly logger = new Logger(SignUpService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async signUp({ walletAddress: address }: SiweVerifyBody) {
    const wallet = await this.databaseService.db.query.walletAddress.findFirst({
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
      await this.databaseService.db
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
