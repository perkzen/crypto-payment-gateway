import { createHmac } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventName } from '@workspace/shared';
import { firstValueFrom } from 'rxjs';

export interface WebhookPayload {
  id: string;
  type: WebhookEventName;
  timestamp: string;
  data: {
    payment: unknown;
    checkoutSession?: unknown;
  };
}

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Generate HMAC-SHA256 signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Deliver webhook to the specified URL
   */
  async deliverWebhook(
    url: string,
    payload: WebhookPayload,
    secret?: string | null,
  ): Promise<void> {
    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add signature if secret is provided
    if (secret) {
      headers['X-Webhook-Signature'] = this.generateSignature(
        payloadString,
        secret,
      );
    }

    try {
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers,
          timeout: 10000, // 10 second timeout
        }),
      );

      this.logger.log(`Webhook delivered successfully to ${url}`);
    } catch (error) {
      this.logger.error(
        `Failed to deliver webhook to ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }
}
