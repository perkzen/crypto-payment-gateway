import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
  WebhookSubscriptionDto,
} from './dtos';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks/subscriptions')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @ApiOperation({ summary: 'Create Webhook Subscription' })
  @ZodResponse({
    type: WebhookSubscriptionDto,
    status: 201,
    description: 'Webhook subscription created successfully',
  })
  @Post()
  async createWebhookSubscription(
    @Session() session: UserSession,
    @Body() body: CreateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.createWebhookSubscription(
      session.session.userId,
      body,
    );
  }

  @ApiOperation({ summary: 'List Webhook Subscriptions' })
  @ZodResponse({
    type: [WebhookSubscriptionDto],
    status: 200,
    description: 'Webhook subscriptions retrieved successfully',
  })
  @Get()
  async listWebhookSubscriptions(@Session() session: UserSession) {
    return this.webhooksService.findWebhookSubscriptionsByUserId(
      session.session.userId,
    );
  }

  @ApiOperation({ summary: 'Update Webhook Subscription' })
  @ZodResponse({
    type: WebhookSubscriptionDto,
    status: 200,
    description: 'Webhook subscription updated successfully',
  })
  @Patch(':id')
  async updateWebhookSubscription(
    @Session() session: UserSession,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.updateWebhookSubscription(
      id,
      session.session.userId,
      body,
    );
  }

  @ApiOperation({ summary: 'Delete Webhook Subscription' })
  @ApiNoContentResponse({
    description: 'Webhook subscription deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteWebhookSubscription(
    @Session() session: UserSession,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.webhooksService.deleteWebhookSubscription(
      id,
      session.session.userId,
    );
  }
}
