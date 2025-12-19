import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { MerchantDto, UpdateMerchantDto } from './dtos';
import { MerchantStatsDto } from './dtos/merchant-stats.dto';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @ApiOperation({ summary: 'Get Merchant Information' })
  @ZodResponse({
    type: MerchantDto,
    status: 200,
    description: 'Merchant information retrieved successfully',
  })
  @Get()
  async getMerchant(@Session() { session }: UserSession) {
    return this.merchantsService.findMerchantByUserId(session.userId);
  }

  @ApiOperation({ summary: 'Update Merchant Information' })
  @ZodResponse({
    type: MerchantDto,
    status: 200,
    description: 'Merchant information updated successfully',
  })
  @Patch()
  async updateMerchant(
    @Session() { session }: UserSession,
    @Body() body: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateMerchant(session.userId, body);
  }

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
