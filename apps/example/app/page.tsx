'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldError, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { MultiSelect } from '@workspace/ui/components/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { CreateCheckoutSessionResult } from '@workspace/shared';
import {
  checkoutSessionDefaultValues,
  checkoutSessionFormOptions,
} from '@/forms/checkout-session';
import { checkoutSessionOptions } from '@/hooks/checkout-session-options';

const FIAT_CURRENCIES = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const CRYPTO_CURRENCIES = [
  { label: 'ETH', value: 'ETH' },
  { label: 'USDT', value: 'USDT' },
  { label: 'USDC', value: 'USDC' },
];

const NETWORKS = [
  { label: 'Hardhat', value: 'hardhat' },
  { label: 'Ethereum', value: 'ethereum' },
];

export default function Home() {
  const [apiKey, setApiKey] = useState('');

  const createCheckoutSessionMutation = useMutation({
    ...checkoutSessionOptions(),
    onSuccess: (data) => {
      window.open(data.checkoutUrl, '_blank');
    },
  });

  const form = useForm({
    ...checkoutSessionFormOptions,
    defaultValues: {
      ...checkoutSessionDefaultValues,
      successUrl:
        typeof window !== 'undefined'
          ? `${window.location.origin}/success`
          : '',
      cancelUrl:
        typeof window !== 'undefined' ? `${window.location.origin}/cancel` : '',
    },
    onSubmit: async ({ value }) => {
      createCheckoutSessionMutation.mutate({ ...value, apiKey });
    },
  });

  const handleRedirect = () => {
    if (createCheckoutSessionMutation.data?.checkoutUrl) {
      window.open(createCheckoutSessionMutation.data.checkoutUrl, '_blank');
    }
  };

  const checkoutSession: CreateCheckoutSessionResult | null =
    createCheckoutSessionMutation.data || null;
  const error = createCheckoutSessionMutation.error
    ? createCheckoutSessionMutation.error.message
    : null;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Crypto Payment Gateway</h1>
          <p className="text-muted-foreground mt-2">Example App</p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">API Configuration</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key (optional)</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your API key"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium">
              Create Checkout Session
            </h2>

            <div className="space-y-4">
              <form.Field name="amountFiat">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>
                      Amount (in cents)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 0)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      min="1"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="fiatCurrency">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Fiat Currency</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value: string) =>
                        field.handleChange(value)
                      }
                      onOpenChange={(open: boolean) => {
                        if (!open) {
                          field.handleBlur();
                        }
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIAT_CURRENCIES.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="allowedCryptoCurrencies">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>
                      Allowed Crypto Currencies
                    </FieldLabel>
                    <MultiSelect
                      options={CRYPTO_CURRENCIES}
                      selected={field.state.value || []}
                      onChange={(selected) => field.handleChange(selected)}
                      placeholder="Select cryptocurrencies"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="allowedNetworks">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>
                      Allowed Networks
                    </FieldLabel>
                    <MultiSelect
                      options={NETWORKS}
                      selected={field.state.value || []}
                      onChange={(selected) => field.handleChange(selected)}
                      placeholder="Select networks"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="customerEmail">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>
                      Customer Email (optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
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

              <form.Field name="successUrl">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Success URL</FieldLabel>
                    <Input
                      id={field.name}
                      type="url"
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

              <form.Field name="cancelUrl">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Cancel URL</FieldLabel>
                    <Input
                      id={field.name}
                      type="url"
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

              <form.Field name="expiresInMinutes">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>
                      Expires In Minutes (optional, default: 60)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 60)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      min="1"
                      max="1440"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {checkoutSession && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Checkout session created successfully!</p>
                <p className="text-sm">Session ID: {checkoutSession.id}</p>
                <Button type="button" onClick={handleRedirect} className="mt-2">
                  Go to Checkout
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Creating...' : 'Create Checkout Session'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </main>
    </div>
  );
}
