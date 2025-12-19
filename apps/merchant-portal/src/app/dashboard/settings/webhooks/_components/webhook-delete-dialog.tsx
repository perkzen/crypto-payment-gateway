import { type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { toast } from '@workspace/ui/components/sonner';
import { deleteWebhookOptions } from '../_hooks/mutations';
import { listWebhooksOptions } from '../_hooks/queries';
import { type Webhook } from '../_types/webhook';

type WebhookDeleteDialogProps = {
  webhook: Webhook;
  children: ReactNode;
};

export function WebhookDeleteDialog({
  webhook,
  children,
}: WebhookDeleteDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isDeleting } = useMutation({
    ...deleteWebhookOptions,
    onSuccess: () => {
      toast.success('Webhook deleted successfully');
      void queryClient.invalidateQueries(listWebhooksOptions);
    },
    onError: () => {
      toast.error('Failed to delete webhook');
    },
  });

  const handleDelete = async () => {
    await mutateAsync(webhook.id);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Webhook</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this webhook endpoint? This action
            cannot be undone. You will stop receiving events at:
            <br />
            <code className="bg-muted mt-2 block rounded px-2 py-1 text-sm">
              {webhook.url}
            </code>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            Delete Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
