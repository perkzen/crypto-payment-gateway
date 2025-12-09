import { DatabaseService } from '@app/modules/database/database.service';
import { merchant, walletAddress } from '@app/modules/database/schemas';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class WalletsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get the primary wallet address for a merchant by merchant ID
   * @param merchantId - The merchant ID
   * @returns The primary wallet address
   * @throws NotFoundException if merchant not found
   * @throws UnprocessableEntityException if no primary wallet address configured
   */
  async getWalletAddressByMerchantId(merchantId: string): Promise<string> {
    // Get merchant to access userId
    const merchantRecord = await this.databaseService.db.query.merchant.findFirst(
      {
        where: eq(merchant.id, merchantId),
        columns: {
          userId: true,
        },
      },
    );

    if (!merchantRecord) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Get merchant's primary wallet address
    const primaryWallet = await this.databaseService.db.query.walletAddress.findFirst(
      {
        where: and(
          eq(walletAddress.userId, merchantRecord.userId),
          eq(walletAddress.isPrimary, true),
        ),
        columns: {
          address: true,
        },
      },
    );

    if (!primaryWallet) {
      throw new UnprocessableEntityException(
        `Merchant with ID ${merchantId} must have a primary wallet address configured`,
      );
    }

    return primaryWallet.address;
  }
}

