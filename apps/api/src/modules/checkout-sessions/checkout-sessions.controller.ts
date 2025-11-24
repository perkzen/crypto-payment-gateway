import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { CheckoutSessionsService } from './checkout-sessions.service';
import {
  CreateCheckoutSessionResultDto,
  CreateCheckoutSessionsDto,
  PublicCheckoutSessionDto,
} from './dtos';

@Controller('checkout/sessions')
export class CheckoutSessionsController {
  constructor(
    private readonly checkoutSessionsService: CheckoutSessionsService,
  ) {}

  @ApiOperation({ summary: 'Create Checkout Session' })
  @ZodResponse({
    type: CreateCheckoutSessionResultDto,
    status: 201,
    description: 'Checkout session created successfully',
  })
  @Post()
  async createCheckoutSession(
    @Session() session: UserSession,
    @Body() body: CreateCheckoutSessionsDto,
  ) {
    return this.checkoutSessionsService.createCheckoutSession(body, session);
  }

  @ApiOperation({ summary: 'Get Checkout Session by ID' })
  @ZodResponse({
    type: PublicCheckoutSessionDto,
    status: 200,
    description: 'Checkout session retrieved successfully',
  })
  @AllowAnonymous()
  @Get(':id')
  async getCheckoutSessionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkoutSessionsService.getCheckoutSessionById(id);
  }
}
