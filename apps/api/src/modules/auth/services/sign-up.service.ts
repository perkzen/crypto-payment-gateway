import { maskWalletAddress } from '@app/common/utils/mask-wallet-address';
import { type SiweVerifyBody } from '@app/modules/auth/dtos/siwe-verify.dto';
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
      this.logger.warn(
        `No wallet found for address ${maskWalletAddress(address)}`,
      );
      return;
    }

    if (!wallet.user) {
      this.logger.error(
        `Wallet ${maskWalletAddress(address)} exists but has no associated user (referential integrity violation)`,
      );
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

      this.logger.log(
        `Merchant record created or already exists for user ${user.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to insert merchant for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
