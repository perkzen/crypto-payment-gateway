'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteApiKeyOptions, updateApiKeyOptions } from '../_hooks/mutations';
import { toast } from '@workspace/ui/components/sonner';
import type { ApiKey } from '../_types/api-key';

type ApiKeyTableActionsProps = {
  apiKey: ApiKey;
};

export function ApiKeyTableActions({ apiKey }: ApiKeyTableActionsProps) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState(apiKey.name || '');

  const { mutate: deleteApiKey, isPending: isDeleting } = useMutation({
    ...deleteApiKeyOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted successfully');
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete API key');
    },
  });

  const { mutate: updateApiKey, isPending: isUpdating } = useMutation({
    ...updateApiKeyOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to update API key');
    },
  });

  const handleEditClick = () => {
    setEditName(apiKey.name || '');
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== apiKey.name) {
      updateApiKey({ keyId: apiKey.id, name: editName });
    } else {
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    deleteApiKey({ keyId: apiKey.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEditClick}>
            <Pencil className="h-4 w-4" />
            Edit name
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the name of your API key to help you identify it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="API key name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={isUpdating}
              loadingText="Saving..."
              disabled={!editName.trim() || editName === apiKey.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key "{apiKey.name}"? This
              action cannot be undone and will immediately revoke access for any
              applications using this key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

