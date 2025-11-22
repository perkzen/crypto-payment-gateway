import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Field, FieldError } from '@workspace/ui/components/field';
import { Key, Plus } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiKeyOptions } from '../_hooks/mutations';
import { toast } from '@workspace/ui/components/sonner';
import { listApiKeysOptions } from '../_hooks/queries';
import { apiKeyFormOptions } from '../_forms/api-key';
import { ApiKeySuccessDialog } from './api-key-success-dialog';

type CreateApiKeyFormContainerProps = {
  children: ReactNode;
};

function CreateApiKeyFormContainer({
  children,
}: CreateApiKeyFormContainerProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <Key className="text-primary h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create New API Key</h2>
          <p className="text-muted-foreground text-sm">
            Give your API key a descriptive name
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function CreateApiKeyForm() {
  const queryClient = useQueryClient();
  const [newApiKey, setNewApiKey] = useState<{
    name: string;
    key: string;
  } | null>(null);

  const { mutateAsync } = useMutation({
    ...createApiKeyOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: listApiKeysOptions.queryKey,
      });
    },
  });

  const form = useForm({
    ...apiKeyFormOptions,
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await mutateAsync(value);
        setNewApiKey({ name: value.name, key: result.key });
        formApi.reset();
        toast.success('API key created successfully!');
      } catch (error) {
        toast.error('Failed to create API key.');
      }
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Production API Key"
                  className="flex-1"
                  value={field.state.value}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
                <form.Subscribe selector={(state) => [state.canSubmit]}>
                  {([canSubmit]) => (
                    <Button type="submit" disabled={!canSubmit}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Key
                    </Button>
                  )}
                </form.Subscribe>
              </div>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </form>

      <ApiKeySuccessDialog
        apiKey={newApiKey}
        onClose={() => setNewApiKey(null)}
      />
    </>
  );
}

export function CreateApiKeyView() {
  return (
    <CreateApiKeyFormContainer>
      <CreateApiKeyForm />
    </CreateApiKeyFormContainer>
  );
}
