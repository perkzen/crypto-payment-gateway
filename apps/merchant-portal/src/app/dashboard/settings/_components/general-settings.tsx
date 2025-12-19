'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldError } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { User } from 'lucide-react';
import { merchantFormOptions } from '../_forms/merchant';
import { updateMerchantOptions } from '../_hooks/merchant-mutations';
import { merchantOptions } from '../_hooks/merchant-queries';

export function GeneralSettings() {
  const queryClient = useQueryClient();
  const { data: merchant, isLoading } = useQuery(merchantOptions);

  const { mutateAsync, isPending } = useMutation({
    ...updateMerchantOptions,
    onSuccess: () => {
      toast.success('Merchant information updated successfully!');
      void queryClient.invalidateQueries(merchantOptions);
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to update merchant information';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error(errorMessage);
      console.error('Merchant update error:', error);
    },
  });

  const form = useForm({
    ...merchantFormOptions,
    defaultValues: {
      displayName: merchant?.displayName ?? '',
      contactEmail: merchant?.contactEmail ?? '',
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        displayName: value.displayName.trim() || null,
        contactEmail: value.contactEmail.trim() || null,
      });
    },
  });

  // Update form when merchant data loads
  React.useEffect(() => {
    if (merchant) {
      form.setFieldValue('displayName', merchant.displayName ?? '');
      form.setFieldValue('contactEmail', merchant.contactEmail ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground">Loading merchant information...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <User className="text-primary h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold">General Settings</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Update your merchant profile and preferences
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="displayName">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <label className="mb-2 block text-sm font-medium">
                    Merchant Name
                  </label>
                  <Input
                    placeholder="Your merchant name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="contactEmail">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isPending || isSubmitting}>
                  {isPending || isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </div>
      </div>
    </div>
  );
}
