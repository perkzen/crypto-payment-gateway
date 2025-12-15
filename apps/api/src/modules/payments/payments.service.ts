import { DatabaseService } from '@app/modules/database/database.service';
import { payment } from '@app/modules/database/schemas';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Injectable } from '@nestjs/common';
import { and, eq, isNotNull } from 'drizzle-orm';
import { CreatePaymentDto, UpdatePaymentDto } from './dtos';
import { PaymentNotFoundException } from './exceptions';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly merchantsService: MerchantsService,
  ) {}

  /**
   * Create payment
   */
  async createPayment(merchantId: string, data: CreatePaymentDto) {
    const [createdPayment] = await this.databaseService.db
      .insert(payment)
      .values({
        ...data,
        merchantId,
        status: 'pending',
        confirmations: 0,
      })
      .onConflictDoNothing({
        target: payment.txHash,
      })
      .returning();

    return createdPayment;
  }

  async updatePayment(id: string, data: UpdatePaymentDto) {
    const existingPayment =
      await this.databaseService.db.query.payment.findFirst({
        where: eq(payment.id, id),
      });

    if (!existingPayment) {
      throw new PaymentNotFoundException(id);
    }

    const [updatedPayment] = await this.databaseService.db
      .update(payment)
      .set(data)
      .where(eq(payment.id, id))
      .returning();

    return updatedPayment;
  }

  /**
   * Find payment by ID
   */
  async findPaymentById(id: string) {
    const foundPayment = await this.databaseService.db.query.payment.findFirst({
      where: eq(payment.id, id),
    });

    if (!foundPayment) {
      throw new PaymentNotFoundException(id);
    }

    return foundPayment;
  }

  /**
   * Get all pending payments with transaction hashes
   */
  async findPendingPayments() {
    return this.databaseService.db
      .select()
      .from(payment)
      .where(and(eq(payment.status, 'pending'), isNotNull(payment.txHash)));
  }
}
