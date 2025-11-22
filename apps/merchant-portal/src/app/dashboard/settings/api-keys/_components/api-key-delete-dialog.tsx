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
import { type ReactNode } from 'react';
import { deleteApiKeyOptions } from '../_hooks/mutations';
import { listApiKeysOptions } from '../_hooks/queries';
import type { ApiKey } from '../_types/api-key';

type ApiKeyDeleteDialogProps = {
  apiKey: ApiKey;
  children: ReactNode;
};

export function ApiKeyDeleteDialog({
  apiKey,
  children,
}: ApiKeyDeleteDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isDeleting } = useMutation({
    ...deleteApiKeyOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries(listApiKeysOptions);
      toast.success('API key deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete API key.');
    },
  });

  const handleDeleteConfirm = async () => {
    await mutateAsync({ keyId: apiKey.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the API key &#34;{apiKey.name}&#34;?
            This action cannot be undone and will immediately revoke access for
            any applications using this key.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild disabled={isDeleting}>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
