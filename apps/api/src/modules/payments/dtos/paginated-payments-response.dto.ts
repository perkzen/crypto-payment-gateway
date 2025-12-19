import { PaginatedPaymentsResponseSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class PaginatedPaymentsResponseDto extends createZodDto(
  PaginatedPaymentsResponseSchema,
) {}
