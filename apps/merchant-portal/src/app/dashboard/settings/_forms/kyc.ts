import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

const kycSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z
      .string()
      .length(2, 'Country must be a 2-letter ISO code')
      .toUpperCase(),
  }),
  documentType: z.enum(['passport', 'drivers_license', 'national_id'], {
    errorMap: () => ({
      message: 'Document type must be passport, drivers_license, or national_id',
    }),
  }),
  documentNumber: z.string().min(1, 'Document number is required'),
});

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  documentType: 'passport' as const,
  documentNumber: '',
};

export const kycFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: kycSchema,
  },
});
