import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession } from '@app/modules/database/schemas';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { CreateCheckoutSessionDto } from './dtos';
import { CheckoutSessionNotFoundException } from './exceptions';

@Injectable()
export class CheckoutSessionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly merchantsService: MerchantsService,
  ) {}

  async createCheckoutSession(
    data: CreateCheckoutSessionDto,
    { session }: UserSession,
  ) {
    const { expiresInMinutes = 60, ...input } = data;
    const { userId } = session;

    const merchant = await this.merchantsService.findMerchantByUserId(userId);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const baseCheckoutUrl = this.configService.getOrThrow('CHECKOUT_URL');
    const [createdSession] = await this.databaseService.db
      .insert(checkoutSession)
      .values({
        ...input,
        expiresAt,
        merchantId: merchant.id,
        checkoutUrl: baseCheckoutUrl,
      })
      .returning();

    // Construct the full checkout URL with session ID as query parameter
    const fullCheckoutUrl = `${baseCheckoutUrl.replace(/\/$/, '')}?sessionId=${createdSession.id}`;

    return {
      id: createdSession.id,
      status: createdSession.status,
      checkoutUrl: fullCheckoutUrl,
      expiresAt: createdSession.expiresAt,
      metadata: createdSession.metadata ?? null,
    };
  }

  async getCheckoutSessionById(id: string) {
    const session =
      await this.databaseService.db.query.checkoutSession.findFirst({
        where: eq(checkoutSession.id, id),
      });

    if (!session) {
      throw new CheckoutSessionNotFoundException(id);
    }

    return {
      id: session.id,
      status: session.status,
      amountFiat: session.amountFiat,
      fiatCurrency: session.fiatCurrency,
      allowedCryptoCurrencies: session.allowedCryptoCurrencies,
      allowedNetworks: session.allowedNetworks,
      expiresAt: session.expiresAt,
    };
  }
}
