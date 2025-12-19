'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Field, FieldError } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { toast } from '@workspace/ui/components/sonner';
import { Calendar as CalendarIcon, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { kycFormOptions } from '../_forms/kyc';
import { submitKycOptions } from '../_hooks/kyc-mutations';
import { kycStatusOptions, type KycStatus } from '../_hooks/kyc-queries';

function getStatusBadge(status: KycStatus['status']) {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <FileText className="mr-1 h-3 w-3" />
          Not Started
        </Badge>
      );
  }
}

function KycStatusDisplay({ status }: { status: KycStatus }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">KYC Status</span>
        {getStatusBadge(status.status)}
      </div>
      {status.submittedAt && (
        <p className="text-muted-foreground text-xs">
          Submitted: {new Date(status.submittedAt).toLocaleDateString()}
        </p>
      )}
      {status.verifiedAt && (
        <p className="text-muted-foreground text-xs">
          Verified: {new Date(status.verifiedAt).toLocaleDateString()}
        </p>
      )}
      {status.rejectionReason && (
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <p className="text-destructive text-sm font-medium">
            Rejection Reason:
          </p>
          <p className="text-destructive text-sm">{status.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

function KycSubmissionForm() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    ...submitKycOptions,
    onSuccess: () => {
      toast.success('KYC information submitted successfully!');
      void queryClient.invalidateQueries(kycStatusOptions);
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to submit KYC information';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error(errorMessage);
      console.error('KYC submission error:', error);
    },
  });

  const form = useForm({
    ...kycFormOptions,
    onSubmit: async ({ value, formApi }) => {
      await mutateAsync({
        ...value,
        address: {
          ...value.address,
          country: value.address.country.toUpperCase(),
        },
      });
      formApi.reset();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="firstName">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <label className="mb-1 block text-sm font-medium">
                First Name
              </label>
              <Input
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

        <form.Field name="lastName">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <label className="mb-1 block text-sm font-medium">Last Name</label>
              <Input
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
      </div>

      <form.Field name="email">
        {(field) => (
          <Field
            data-invalid={
              field.state.meta.isTouched && !field.state.meta.isValid
            }
          >
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
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

      <form.Field name="dateOfBirth">
        {(field) => {
          const dateValue = field.state.value
            ? new Date(field.state.value + 'T00:00:00')
            : undefined;

          return (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <label className="mb-1 block text-sm font-medium">
                Date of Birth
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full justify-start text-left font-normal"
                    data-empty={!dateValue}
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? (
                      format(dateValue, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">
                        Pick a date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                      if (date) {
                        // Format as YYYY-MM-DD for the form
                        const formattedDate = format(date, 'yyyy-MM-dd');
                        field.handleChange(formattedDate);
                        field.handleBlur();
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          );
        }}
      </form.Field>

      <div>
        <label className="mb-2 block text-sm font-medium">Address</label>
        <div className="space-y-2">
          <form.Field name="address.street">
            {(field) => (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
                <Input
                  placeholder="Street address"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-2">
            <form.Field name="address.city">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <Input
                    placeholder="City"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="address.state">
              {(field) => (
                <Field>
                  <Input
                    placeholder="State/Province (optional)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <form.Field name="address.postalCode">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <Input
                    placeholder="Postal Code"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="address.country">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <Input
                    placeholder="Country (2-letter code, e.g., US)"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.handleBlur}
                    maxLength={2}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="documentType">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <label className="mb-1 block text-sm font-medium">
                Document Type
              </label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">
                    Driver's License
                  </SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="documentNumber">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <label className="mb-1 block text-sm font-medium">
                Document Number
              </label>
              <Input
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
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isPending || isSubmitting}>
            {isPending || isSubmitting ? 'Submitting...' : 'Submit KYC'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export function KycSection() {
  const { data: kycStatus, isLoading } = useQuery(kycStatusOptions);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground">Loading KYC status...</div>
      </div>
    );
  }

  if (!kycStatus) {
    return null;
  }

  const canSubmit =
    kycStatus.status === 'not_started' || kycStatus.status === 'rejected';

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <FileText className="text-primary h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold">KYC Verification</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Complete KYC verification to enable checkout session creation
          </p>
          <KycStatusDisplay status={kycStatus} />
        </div>
      </div>

      {canSubmit && (
        <div className="border-t pt-6">
          <h4 className="mb-4 text-sm font-semibold">Submit KYC Information</h4>
          <KycSubmissionForm />
        </div>
      )}

      {kycStatus.status === 'pending' && (
        <div className="border-t pt-4">
          <p className="text-muted-foreground text-sm">
            Your KYC submission is being reviewed. This usually takes a few
            seconds. Please check back shortly.
          </p>
        </div>
      )}

      {kycStatus.status === 'verified' && (
        <div className="border-t pt-4">
          <p className="text-muted-foreground text-sm">
            Your KYC verification is complete. You can now create checkout
            sessions.
          </p>
        </div>
      )}
    </div>
  );
}
