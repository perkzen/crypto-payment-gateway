import { DatabaseService } from '@app/modules/database/database.service';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { webhookSubscription } from '@app/modules/database/schemas';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { WebhookEventName } from '@workspace/shared';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
} from './dtos';
import { WebhookSubscriptionNotFoundException } from './exceptions';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly merchantsService: MerchantsService,
  ) {}

  async createWebhookSubscription(
    userId: string,
    data: CreateWebhookSubscriptionDto,
  ) {
    const merchant = await this.merchantsService.findMerchantByUserId(userId);

    const [created] = await this.databaseService.db
      .insert(webhookSubscription)
      .values({
        merchantId: merchant.id,
        url: data.url,
        events: data.events,
        secret: data.secret || null,
        isActive: true,
      })
      .returning();

    return created;
  }

  async findWebhookSubscriptionsByUserId(userId: string) {
    const merchant = await this.merchantsService.findMerchantByUserId(userId);

    return this.databaseService.db.query.webhookSubscription.findMany({
      where: eq(webhookSubscription.merchantId, merchant.id),
    });
  }

  async findWebhookSubscriptionById(id: string) {
    const subscription =
      await this.databaseService.db.query.webhookSubscription.findFirst({
        where: eq(webhookSubscription.id, id),
      });

    if (!subscription) {
      throw new WebhookSubscriptionNotFoundException(id);
    }

    return subscription;
  }

  async updateWebhookSubscription(
    id: string,
    userId: string,
    data: UpdateWebhookSubscriptionDto,
  ) {
    const merchant = await this.merchantsService.findMerchantByUserId(userId);
    const subscription = await this.findWebhookSubscriptionById(id);

    // Verify ownership
    if (subscription.merchantId !== merchant.id) {
      throw new WebhookSubscriptionNotFoundException(id);
    }

    const [updated] = await this.databaseService.db
      .update(webhookSubscription)
      .set({
        ...(data.url && { url: data.url }),
        ...(data.events && { events: data.events }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.secret !== undefined && { secret: data.secret || null }),
      })
      .where(eq(webhookSubscription.id, id))
      .returning();

    return updated;
  }

  async deleteWebhookSubscription(id: string, userId: string) {
    const merchant = await this.merchantsService.findMerchantByUserId(userId);
    const subscription = await this.findWebhookSubscriptionById(id);

    // Verify ownership
    if (subscription.merchantId !== merchant.id) {
      throw new WebhookSubscriptionNotFoundException(id);
    }

    await this.databaseService.db
      .delete(webhookSubscription)
      .where(eq(webhookSubscription.id, id));
  }

  async findActiveSubscriptionsByMerchantIdAndEvent(
    merchantId: string,
    event: WebhookEventName,
  ) {
    return this.databaseService.db
      .select()
      .from(webhookSubscription)
      .where(
        and(
          eq(webhookSubscription.merchantId, merchantId),
          eq(webhookSubscription.isActive, true),
        ),
      )
      .then((subscriptions) =>
        subscriptions.filter((sub) => sub.events.includes(event)),
      );
  }
}
