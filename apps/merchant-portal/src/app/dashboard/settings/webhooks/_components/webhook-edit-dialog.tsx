import { type ReactNode, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type CreateWebhookSubscription,
  type UpdateWebhookSubscription,
  WebhookEventName,
  type WebhookEventName as WebhookEventNameType,
} from '@workspace/shared';
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
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { Check, Plus } from 'lucide-react';
import { webhookFormOptions } from '../_forms/webhook';
import { createWebhookOptions, updateWebhookOptions } from '../_hooks/mutations';
import { listWebhooksOptions } from '../_hooks/queries';
import { type Webhook } from '../_types/webhook';

const availableEvents = [
  { value: WebhookEventName.PaymentCreated, label: 'Payment Created' },
  { value: WebhookEventName.PaymentCompleted, label: 'Payment Completed' },
  { value: WebhookEventName.PaymentFailed, label: 'Payment Failed' },
];

type WebhookFormProps = {
  webhook?: Webhook;
  onSuccess?: () => void;
};

function WebhookForm({ webhook, onSuccess }: WebhookFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!webhook;

  const { mutateAsync: createWebhook, isPending: isCreating } = useMutation({
    ...createWebhookOptions,
    onSuccess: () => {
      toast.success('Webhook created successfully!');
      void queryClient.invalidateQueries(listWebhooksOptions);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create webhook.');
    },
  });

  const { mutateAsync: updateWebhook, isPending: isUpdating } = useMutation({
    ...updateWebhookOptions,
    onSuccess: () => {
      toast.success('Webhook updated successfully!');
      void queryClient.invalidateQueries(listWebhooksOptions);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update webhook.');
    },
  });

  const isPending = isCreating || isUpdating;

  const allowedEvents = [
    WebhookEventName.PaymentCreated,
    WebhookEventName.PaymentCompleted,
    WebhookEventName.PaymentFailed,
  ] as const;

  const form = useForm({
    defaultValues: webhook
      ? {
          url: webhook.url,
          events: webhook.events.filter((e) =>
            allowedEvents.includes(e as (typeof allowedEvents)[number]),
          ) as WebhookEventNameType[],
          ...(webhook.secret ? { secret: webhook.secret } : {}),
        }
      : webhookFormOptions.defaultValues,
    validators: webhookFormOptions.validators,
    onSubmit: async ({ value, formApi }) => {
      const formValue = value as { url: string; events: unknown[]; secret?: string };
      const events = formValue.events.filter((e) =>
        allowedEvents.includes(e as (typeof allowedEvents)[number]),
      ) as CreateWebhookSubscription['events'];

      if (isEditMode && webhook) {
        const updates: UpdateWebhookSubscription = {
          url: formValue.url,
          events,
          secret: formValue.secret || undefined,
        };
        await updateWebhook({
          id: webhook.id,
          updates,
        });
      } else {
        const createData: CreateWebhookSubscription = {
          url: formValue.url,
          events,
          secret: formValue.secret || undefined,
        };
        await createWebhook(createData);
        formApi.reset();
      }
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
      <div className="space-y-4 py-4">
        <form.Field name="url">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <Label htmlFor={field.name}>Webhook URL</Label>
              <Input
                type="url"
                value={field.state.value}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                disabled={isPending}
                autoFocus
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="events">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <Label>Events to Subscribe</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableEvents.map((event) => {
                  const isSelected = field.state.value.includes(event.value);
                  return (
                    <button
                      key={event.value}
                      type="button"
                      onClick={() => {
                        const current = field.state.value;
                        const updated = isSelected
                          ? current.filter((e) => e !== event.value)
                          : [...current, event.value];
                        field.handleChange(updated);
                      }}
                      className={`hover:bg-accent flex items-center gap-2 rounded-md border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      disabled={isPending}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/20'
                        }`}
                      >
                        {isSelected && (
                          <Check className="text-primary-foreground h-3 w-3" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{event.label}</span>
                    </button>
                  );
                })}
              </div>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="secret">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>
                Secret (Optional)
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  {isEditMode
                    ? 'Leave empty to keep current secret'
                    : 'For HMAC signature verification'}
                </span>
              </Label>
              <Input
                type="password"
                placeholder={
                  isEditMode
                    ? 'Enter new secret or leave empty'
                    : 'Leave empty to auto-generate'
                }
                value={(field.state.value as string | undefined) || ''}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const newValue = e.target.value.trim() || undefined;
                  field.handleChange(newValue);
                }}
                disabled={isPending}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {isEditMode
                  ? 'Only update if you want to change the webhook secret'
                  : 'If provided, this secret will be used to sign webhook payloads with HMAC-SHA256'}
              </p>
            </Field>
          )}
        </form.Field>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isSubmitted,
            state.values.url,
            state.values.events,
          ]}
        >
          {([canSubmit, isSubmitted, url, events]) => {
            const urlValue = typeof url === 'string' ? url.trim() : '';
            const eventsArray = Array.isArray(events) ? events : [];
            const isValid =
              canSubmit &&
              urlValue !== '' &&
              eventsArray.length > 0;
            return (
              <DialogClose asChild disabled={!isSubmitted || isPending}>
                <Button
                  type="submit"
                  loading={isPending}
                  loadingText={isEditMode ? 'Saving...' : 'Creating...'}
                  disabled={!isValid || isPending}
                >
                  {isEditMode ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Webhook
                    </>
                  )}
                </Button>
              </DialogClose>
            );
          }}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

type WebhookDialogProps = {
  webhook?: Webhook;
  children: ReactNode;
};

export function WebhookDialog({ webhook, children }: WebhookDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!webhook;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Webhook' : 'Create Webhook'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your webhook endpoint URL, subscribed events, or secret.'
              : 'Add an endpoint to receive payment event notifications.'}
          </DialogDescription>
        </DialogHeader>
        <WebhookForm webhook={webhook} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

// Keep the old name for backward compatibility
export function WebhookEditDialog({
  webhook,
  children,
}: { webhook: Webhook; children: ReactNode }) {
  return <WebhookDialog webhook={webhook}>{children}</WebhookDialog>;
}
