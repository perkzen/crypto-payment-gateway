import { CHECKOUT_URL } from '@app/common/contants';
import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession, merchant } from '@app/modules/database/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { CreateCheckoutSessionsDto } from './dtos';

@Injectable()
export class CheckoutSessionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createCheckoutSession(
    data: CreateCheckoutSessionsDto,
    { session }: UserSession,
  ) {
    const { expiresInMinutes = 60, ...input } = data;
    const { userId } = session;

    const merchantResult =
      await this.databaseService.db.query.merchant.findFirst({
        where: eq(merchant.userId, userId),
        columns: { id: true },
      });

    if (!merchantResult) {
      throw new NotFoundException();
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    return this.databaseService.db
      .insert(checkoutSession)
      .values({
        ...input,
        expiresAt,
        merchantId: merchantResult.id,
        checkoutUrl: CHECKOUT_URL,
      })
      .returning();
  }

  async getCheckoutSessionById(id: string) {
    const session =
      await this.databaseService.db.query.checkoutSession.findFirst({
        where: eq(checkoutSession.id, id),
      });

    if (!session) {
      throw new NotFoundException();
    }

    return session;
  }
}
