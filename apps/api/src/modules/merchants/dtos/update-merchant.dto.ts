import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMerchantSchema = z.object({
  displayName: z.string().nullable().optional(),
  contactEmail: z.string().email('Invalid email address').nullable().optional(),
});

export class UpdateMerchantDto extends createZodDto(UpdateMerchantSchema) {}
