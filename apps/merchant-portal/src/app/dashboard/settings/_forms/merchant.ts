import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

const merchantSchema = z.object({
  displayName: z.string().optional(),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

const defaultValues = {
  displayName: '',
  contactEmail: '',
};

export const merchantFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: merchantSchema,
  },
});
