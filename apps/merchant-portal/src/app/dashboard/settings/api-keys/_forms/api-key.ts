import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

const apiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
});

const defaultValues = {
  name: '',
};

export const apiKeyFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: apiKeySchema,
  },
});
