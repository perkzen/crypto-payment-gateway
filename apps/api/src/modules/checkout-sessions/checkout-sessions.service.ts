import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession } from '@app/modules/database/schemas';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { WalletsService } from '@app/modules/wallets/wallets.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { keccak256, toHex } from 'viem';
import { CreateCheckoutSessionDto } from './dtos';
import { CheckoutSessionNotFoundException } from './exceptions';

@Injectable()
export class CheckoutSessionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly merchantsService: MerchantsService,
    private readonly walletsService: WalletsService,
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

    // Compute hashedId from the generated session ID and update
    const hashedId = keccak256(toHex(createdSession.id));
    await this.databaseService.db
      .update(checkoutSession)
      .set({ hashedId })
      .where(eq(checkoutSession.id, createdSession.id));

    // Construct the full checkout URL with session ID as query parameter
    const fullCheckoutUrl = `${baseCheckoutUrl.replace(/\/$/, '')}?sessionId=${createdSession.id}`;

    return {
      id: createdSession.id,
      checkoutUrl: fullCheckoutUrl,
      expiresAt: createdSession.expiresAt,
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

    // Get merchant's primary wallet address dynamically
    const merchantWalletAddress =
      await this.walletsService.getWalletAddressByMerchantId(
        session.merchantId,
      );

    return {
      id: session.id,
      amountFiat: session.amountFiat,
      fiatCurrency: session.fiatCurrency,
      allowedCryptoCurrencies: session.allowedCryptoCurrencies,
      allowedNetworks: session.allowedNetworks,
      merchantWalletAddress,
      expiresAt: session.expiresAt,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
    };
  }

  /**
   * Find checkout session by hashed ID (bytes32 from blockchain event)
   * The frontend uses keccak256(toHex(checkoutSession.id)) to generate the bytes32 hash
   */
  async findCheckoutSessionByHashedId(hashedId: string) {
    return this.databaseService.db.query.checkoutSession.findFirst({
      where: eq(checkoutSession.hashedId, hashedId.toLowerCase()),
    });
  }

  /**
   * Find checkout session by payment ID
   */
  async findCheckoutSessionByPaymentId(paymentId: string) {
    return this.databaseService.db.query.checkoutSession.findFirst({
      where: eq(checkoutSession.paymentId, paymentId),
    });
  }

  /**
   * Update checkout session
   */
  async updateCheckoutSession(
    id: string,
    data: {
      paymentId?: string;
      completedAt?: Date;
    },
  ) {
    const existingSession =
      await this.databaseService.db.query.checkoutSession.findFirst({
        where: eq(checkoutSession.id, id),
      });

    if (!existingSession) {
      throw new CheckoutSessionNotFoundException(id);
    }

    const [updatedSession] = await this.databaseService.db
      .update(checkoutSession)
      .set(data)
      .where(eq(checkoutSession.id, id))
      .returning();

    return updatedSession;
  }
}
