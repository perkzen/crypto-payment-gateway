'use client';

import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { WebhookDialog } from './_components/webhook-edit-dialog';
import { WebhooksListView } from './_components';

export default function WebhooksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Webhooks"
        description="Configure webhook endpoints to receive real-time payment event notifications"
        actions={
          <WebhookDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Webhook
            </Button>
          </WebhookDialog>
        }
      />

      <WebhooksListView />

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-500">
          Webhook Documentation
        </h3>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>Webhooks are sent via HTTP POST requests to your endpoint</li>
          <li>
            Each webhook includes an HMAC-SHA256 signature in the{' '}
            <code className="bg-muted rounded px-1">X-Webhook-Signature</code>{' '}
            header for verification
          </li>
          <li>Your endpoint should respond with a 2xx status code</li>
          <li>Failed deliveries will be retried with exponential backoff</li>
          <li>
            Webhook payloads include event type, timestamp, and payment data
          </li>
        </ul>
      </div>
    </div>
  );
}
