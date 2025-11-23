import { Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create payment' })
  @Post()
  async createPayment() {}
}
