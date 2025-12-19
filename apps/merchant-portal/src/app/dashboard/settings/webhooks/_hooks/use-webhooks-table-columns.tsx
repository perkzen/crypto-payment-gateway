import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { WebhookEventName } from '@workspace/shared';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';
import { CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Trash2, XCircle } from 'lucide-react';
import { WebhookDeleteDialog } from '../_components/webhook-delete-dialog';
import { WebhookEditDialog } from '../_components/webhook-edit-dialog';
import { type Webhook } from '../_types/webhook';
import { updateWebhookOptions } from './mutations';
import { listWebhooksOptions } from './queries';

const eventLabels: Record<string, string> = {
  [WebhookEventName.PaymentCreated]: 'Created',
  [WebhookEventName.PaymentCompleted]: 'Completed',
  [WebhookEventName.PaymentFailed]: 'Failed',
  // Legacy events (for backward compatibility with existing webhooks)
  [WebhookEventName.PaymentPending]: 'Pending',
  [WebhookEventName.PaymentExpired]: 'Expired',
};

export function useWebhooksTableColumns(): ColumnDef<Webhook>[] {
  const queryClient = useQueryClient();

  const { mutateAsync: toggleStatus } = useMutation({
    ...updateWebhookOptions,
    onSuccess: () => {
      toast.success('Webhook status updated');
      void queryClient.invalidateQueries(listWebhooksOptions);
    },
    onError: () => {
      toast.error('Failed to update webhook status');
    },
  });

  return [
    {
      accessorKey: 'url',
      header: 'Webhook URL',
      cell: ({ row }) => {
        const webhook = row.original;
        return (
          <div className="flex items-center gap-2">
            <a
              href={webhook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {webhook.url}
            </a>
            <ExternalLink className="text-muted-foreground h-3 w-3" />
          </div>
        );
      },
    },
    {
      accessorKey: 'events',
      header: 'Events',
      cell: ({ row }) => {
        const events = row.original.events;
        return (
          <div className="flex flex-wrap gap-1">
            {events.map((event) => (
              <Badge key={event} variant="secondary" className="text-xs">
                {eventLabels[event as WebhookEventName] || event}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={`gap-1 ${
              isActive
                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                : ''
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-muted-foreground text-sm">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const webhook = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <WebhookEditDialog webhook={webhook}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </WebhookEditDialog>
              <DropdownMenuItem
                onClick={() => {
                  void toggleStatus({
                    id: webhook.id,
                    updates: { isActive: !webhook.isActive },
                  });
                }}
              >
                {webhook.isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <WebhookDeleteDialog webhook={webhook}>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </WebhookDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
