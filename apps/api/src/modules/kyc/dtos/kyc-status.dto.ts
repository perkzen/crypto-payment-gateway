import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const KycStatusSchema = z.object({
  status: z.enum(['not_started', 'pending', 'verified', 'rejected']),
  providerId: z.string().nullable(),
  submittedAt: z.coerce.date().nullable(),
  verifiedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
});

export class KycStatusDto extends createZodDto(KycStatusSchema) {}
