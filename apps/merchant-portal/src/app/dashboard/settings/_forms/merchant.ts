import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

const merchantSchema = z.object({
  displayName: z.string(),
  contactEmail: z.string(),
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
