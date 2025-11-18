import { HealthCheckDto } from '@app/common/dtos/health-check.dto';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health Check' })
  @ZodResponse({
    type: HealthCheckDto,
    status: 200,
    description: 'Health check status',
  })
  @Get('health')
  @AllowAnonymous()
  async getHealth() {
    return this.appService.healthCheck();
  }
}
