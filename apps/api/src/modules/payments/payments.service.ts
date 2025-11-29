import { DatabaseService } from '@app/modules/database/database.service';
import { payment } from '@app/modules/database/schemas';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Injectable } from '@nestjs/common';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { CreatePaymentDto, UpdatePaymentDto } from './dtos';
import { PaymentNotFoundException } from './exceptions';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly merchantsService: MerchantsService,
  ) {}

  async createPayment(data: CreatePaymentDto, { session }: UserSession) {
    const { userId } = session;

    const merchant = await this.merchantsService.findMerchantByUserId(userId);

    const [createdPayment] = await this.databaseService.db
      .insert(payment)
      .values({
        ...data,
        merchantId: merchant.id,
        status: 'pending',
        confirmations: 0,
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
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, id))
      .returning();

    return updatedPayment;
  }
}
