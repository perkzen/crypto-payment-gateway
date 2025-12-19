import { MerchantsModule } from '@app/modules/merchants/merchants.module';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookDeliveryProcessor } from './processors/webhook-delivery.processor';
import { WebhookDeliveryService } from './services/webhook-delivery.service';
import { WebhookQueueService } from './services/webhook-queue.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    MerchantsModule,
    HttpModule,
    ...configureQueue([QueueName.WEBHOOK_DELIVERY]),
  ],
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    WebhookDeliveryService,
    WebhookQueueService,
    WebhookDeliveryProcessor,
  ],
  exports: [WebhooksService, WebhookQueueService],
})
export class WebhooksModule {}
