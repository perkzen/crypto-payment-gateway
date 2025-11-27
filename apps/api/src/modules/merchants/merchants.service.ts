import { DatabaseService } from '@app/modules/database/database.service';
import { merchant } from '@app/modules/database/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class MerchantsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findMerchantByUserId(userId: string) {
    const result = await this.databaseService.db.query.merchant.findFirst({
      where: eq(merchant.userId, userId),
    });

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}
