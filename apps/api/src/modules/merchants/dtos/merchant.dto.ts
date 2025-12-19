import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MerchantSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  contactEmail: z.string().email().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class MerchantDto extends createZodDto(MerchantSchema) {}
