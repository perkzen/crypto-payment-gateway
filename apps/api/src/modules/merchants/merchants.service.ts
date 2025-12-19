import { DatabaseService } from '@app/modules/database/database.service';
import {
  checkoutSession,
  merchant,
  payment,
} from '@app/modules/database/schemas';
import { Injectable } from '@nestjs/common';
import { and, count, eq, gte, sql } from 'drizzle-orm';
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

    // Get time-series data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Generate all dates for the last 30 days
    const dateArray: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dateArray.push(date);
    }

    // Get daily transaction counts
    const dailyTransactions = await this.databaseService.db
      .select({
        date: sql<string>`${payment.createdAt}::date::text`,
        count: count(),
      })
      .from(payment)
      .where(
        and(
          eq(payment.merchantId, merchant.id),
          gte(payment.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`${payment.createdAt}::date`);

    // Get daily confirmed and failed counts
    const dailyConfirmed = await this.databaseService.db
      .select({
        date: sql<string>`${payment.createdAt}::date::text`,
        count: count(),
      })
      .from(payment)
      .where(
        and(
          eq(payment.merchantId, merchant.id),
          eq(payment.status, 'confirmed'),
          gte(payment.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`${payment.createdAt}::date`);

    const dailyFailed = await this.databaseService.db
      .select({
        date: sql<string>`${payment.createdAt}::date::text`,
        count: count(),
      })
      .from(payment)
      .where(
        and(
          eq(payment.merchantId, merchant.id),
          eq(payment.status, 'failed'),
          gte(payment.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`${payment.createdAt}::date`);

    // Get daily revenue
    const dailyRevenue = await this.databaseService.db
      .select({
        date: sql<string>`${payment.createdAt}::date::text`,
        total: sql<number>`COALESCE(SUM(${checkoutSession.amountFiat}), 0)`,
      })
      .from(checkoutSession)
      .innerJoin(payment, eq(checkoutSession.paymentId, payment.id))
      .where(
        and(
          eq(checkoutSession.merchantId, merchant.id),
          eq(payment.status, 'confirmed'),
          gte(payment.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`${payment.createdAt}::date`);

    // Create maps for quick lookup
    const transactionsMap = new Map(
      dailyTransactions.map((item) => [item.date, Number(item.count)]),
    );
    const confirmedMap = new Map(
      dailyConfirmed.map((item) => [item.date, Number(item.count)]),
    );
    const failedMap = new Map(
      dailyFailed.map((item) => [item.date, Number(item.count)]),
    );
    const revenueMap = new Map(
      dailyRevenue.map((item) => [item.date, Number(item.total)]),
    );

    // Build time-series data
    const timeSeries = dateArray.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const transactions = transactionsMap.get(dateStr) ?? 0;
      const confirmed = confirmedMap.get(dateStr) ?? 0;
      const failed = failedMap.get(dateStr) ?? 0;
      const revenue = revenueMap.get(dateStr) ?? 0;
      const successRateForDay =
        confirmed + failed > 0 ? (confirmed / (confirmed + failed)) * 100 : 0;

      return {
        date: dateStr,
        transactions,
        revenue,
        successRate: Math.round(successRateForDay * 100) / 100,
        confirmed,
        failed,
      };
    });

    return {
      totalRevenue,
      totalTransactions,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
      confirmedCount,
      failedCount,
      timeSeries,
    };
  }
}
