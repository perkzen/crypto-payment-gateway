import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { MerchantStatsDto } from './dtos/merchant-stats.dto';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @ApiOperation({ summary: 'Get Merchant Statistics' })
  @ZodResponse({
    type: MerchantStatsDto,
    status: 200,
    description: 'Merchant statistics retrieved successfully',
  })
  @Get('stats')
  async getMerchantStats(@Session() { session }: UserSession) {
    return this.merchantsService.getMerchantStats(session.userId);
  }
}
