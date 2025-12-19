import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { GetPaymentsQueryDto, PaginatedPaymentsResponseDto } from './dtos';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Get paginated payments' })
  @ZodResponse({
    type: PaginatedPaymentsResponseDto,
    status: 200,
    description: 'Payments retrieved successfully',
  })
  @Get()
  async getPayments(
    @Session() { session }: UserSession,
    @Query() query: GetPaymentsQueryDto,
  ) {
    return this.paymentsService.findPaymentsPaginated(session.userId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
      sortOrder: query.sortOrder,
    });
  }
}
