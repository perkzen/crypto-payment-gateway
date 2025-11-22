import { type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
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
import { Field, FieldError } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { apiKeyFormOptions } from '../_forms/api-key';
import { updateApiKeyOptions } from '../_hooks/mutations';
import { listApiKeysOptions } from '../_hooks/queries';
import type { ApiKey } from '../_types/api-key';

type ApiKeyEditFormProps = {
  apiKey: ApiKey;
};

function ApiKeyEditForm({ apiKey }: ApiKeyEditFormProps) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isUpdating } = useMutation({
    ...updateApiKeyOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries(listApiKeysOptions);
      toast.success('API key updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update API key.');
    },
  });

  const form = useForm({
    ...apiKeyFormOptions,
    defaultValues: {
      name: apiKey.name || '',
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ keyId: apiKey.id, name: value.name });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="py-4">
        <form.Field name="name">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <Input
                value={field.state.value}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="API key name"
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                autoFocus
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isUpdating}>
            Cancel
          </Button>
        </DialogClose>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitted]}
        >
          {([canSubmit, isSubmitted]) => (
            <DialogClose asChild disabled={!isSubmitted || isUpdating}>
              <Button
                type="submit"
                loading={isUpdating}
                loadingText="Saving..."
                disabled={!canSubmit}
              >
                Save Changes
              </Button>
            </DialogClose>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

type ApiKeyEditDialogProps = {
  apiKey: ApiKey;
  children: ReactNode;
};

export function ApiKeyEditDialog({ apiKey, children }: ApiKeyEditDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the name of your API key to help you identify it.
          </DialogDescription>
        </DialogHeader>
        <ApiKeyEditForm apiKey={apiKey} />
      </DialogContent>
    </Dialog>
  );
}
