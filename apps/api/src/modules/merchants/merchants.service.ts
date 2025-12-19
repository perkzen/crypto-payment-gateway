import { DatabaseService } from '@app/modules/database/database.service';
import {
  checkoutSession,
  merchant,
  payment,
} from '@app/modules/database/schemas';
import { Injectable } from '@nestjs/common';
import { and, count, eq, sql } from 'drizzle-orm';
import { MerchantNotFoundException } from './exceptions';

@Injectable()
export class MerchantsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findMerchantByUserId(userId: string) {
    const result = await this.databaseService.db.query.merchant.findFirst({
      where: eq(merchant.userId, userId),
    });

    if (!result) {
      throw new MerchantNotFoundException(userId);
    }

    return result;
  }

  async updateMerchant(
    userId: string,
    data: { displayName?: string | null; contactEmail?: string | null },
  ) {
    const merchantRecord = await this.findMerchantByUserId(userId);

    const updateData: {
      displayName?: string | null;
      contactEmail?: string | null;
    } = {};
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName === '' ? null : data.displayName;
    }
    if (data.contactEmail !== undefined) {
      updateData.contactEmail = data.contactEmail === '' ? null : data.contactEmail;
    }

    const [updated] = await this.databaseService.db
      .update(merchant)
      .set(updateData)
      .where(eq(merchant.id, merchantRecord.id))
      .returning();

    return updated;
  }

  async getMerchantStats(userId: string) {
    const merchant = await this.findMerchantByUserId(userId);

    // Total transactions count
    const totalTransactionsResult = await this.databaseService.db
      .select({ total: count() })
      .from(payment)
      .where(eq(payment.merchantId, merchant.id));
    const totalTransactions = Number(totalTransactionsResult[0]?.total ?? 0);

    // Count confirmed and failed payments
    const confirmedResult = await this.databaseService.db
      .select({ count: count() })
      .from(payment)
      .where(
        and(
          eq(payment.merchantId, merchant.id),
          eq(payment.status, 'confirmed'),
        ),
      );
    const confirmedCount = Number(confirmedResult[0]?.count ?? 0);

    const failedResult = await this.databaseService.db
      .select({ count: count() })
      .from(payment)
      .where(
        and(
          eq(payment.merchantId, merchant.id),
          eq(payment.status, 'failed'),
        ),
      );
    const failedCount = Number(failedResult[0]?.count ?? 0);

    // Calculate success rate (confirmed / (confirmed + failed))
    const successRate =
      confirmedCount + failedCount > 0
        ? (confirmedCount / (confirmedCount + failedCount)) * 100
        : 0;

    // Total revenue: sum of amountFiat from checkout sessions where payment is confirmed
    const revenueResult = await this.databaseService.db
      .select({
        total: sql<number>`COALESCE(SUM(${checkoutSession.amountFiat}), 0)`,
      })
      .from(checkoutSession)
      .innerJoin(payment, eq(checkoutSession.paymentId, payment.id))
      .where(
        and(
          eq(checkoutSession.merchantId, merchant.id),
          eq(payment.status, 'confirmed'),
        ),
      );
    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    return {
      totalRevenue,
      totalTransactions,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
      confirmedCount,
      failedCount,
    };
  }
}
