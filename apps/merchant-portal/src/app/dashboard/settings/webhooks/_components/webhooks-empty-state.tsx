import { Webhook } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { WebhookDialog } from './webhook-edit-dialog';

export function WebhooksEmptyState() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Webhook className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No webhooks configured</h3>
        <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
          Create your first webhook endpoint to receive real-time payment event
          notifications. Webhooks help you stay updated on payment status changes
          without polling our API.
        </p>
        <WebhookDialog>
          <Button>
            <Webhook className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </WebhookDialog>
      </div>
    </div>
  );
}
