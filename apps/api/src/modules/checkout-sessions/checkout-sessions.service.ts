import { CHECKOUT_URL } from '@app/common/contants';
import { InjectDatabaseConnection } from '@app/modules/database/deocrators/inject-database-connection.decoractor';
import { checkoutSession, merchant } from '@app/modules/database/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { CreateCheckoutSessionsDto } from './dtos';
import type { Database } from '@app/modules/database/utils/get-database-connection';

@Injectable()
export class CheckoutSessionsService {
  constructor(@InjectDatabaseConnection() private readonly db: Database) {}

  async createCheckoutSession(
    data: CreateCheckoutSessionsDto,
    { session }: UserSession,
  ) {
    const { expiresInMinutes, ...input } = data;
    const { userId } = session;

    const merchantResult = await this.db.query.merchant.findFirst({
      where: eq(merchant.userId, userId),
      columns: { id: true },
    });

    if (!merchantResult) {
      throw new NotFoundException();
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    return this.db
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
    const session = await this.db.query.checkoutSession.findFirst({
      where: eq(checkoutSession.id, id),
    });

    if (!session) {
      throw new NotFoundException();
    }

    return session;
  }
}
