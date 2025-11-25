import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession, merchant } from '@app/modules/database/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { CreateCheckoutSessionDto } from './dtos';

@Injectable()
export class CheckoutSessionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async createCheckoutSession(
    data: CreateCheckoutSessionDto,
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

    const [createdSession] = await this.databaseService.db
      .insert(checkoutSession)
      .values({
        ...input,
        expiresAt,
        merchantId: merchantResult.id,
        checkoutUrl: this.configService.getOrThrow('CHECKOUT_URL'),
      })
      .returning();

    // Transform to match CreateCheckoutSessionResultSchema
    // Only return fields defined in the schema
    return {
      id: createdSession.id,
      status: createdSession.status,
      checkoutUrl: createdSession.checkoutUrl,
      expiresAt: createdSession.expiresAt, // Date object
      metadata: createdSession.metadata ?? null, // Can be null
    };
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
