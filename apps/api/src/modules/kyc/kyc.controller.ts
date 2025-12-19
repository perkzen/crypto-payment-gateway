import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { KycStatusDto, SubmitKycDto } from './dtos';
import { KycService } from './kyc.service';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @ApiOperation({ summary: 'Submit KYC Information' })
  @ZodResponse({
    type: KycStatusDto,
    status: 201,
    description: 'KYC information submitted successfully',
  })
  @Post('submit')
  async submitKyc(
    @Session() { session }: UserSession,
    @Body() body: SubmitKycDto,
  ) {
    return this.kycService.submitKyc(session.userId, body);
  }

  @ApiOperation({ summary: 'Get KYC Status' })
  @ZodResponse({
    type: KycStatusDto,
    status: 200,
    description: 'KYC status retrieved successfully',
  })
  @Get('status')
  async getKycStatus(@Session() { session }: UserSession) {
    return this.kycService.getKycStatus(session.userId);
  }
}
