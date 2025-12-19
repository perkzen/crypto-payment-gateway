import { GetPaymentsQuerySchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class GetPaymentsQueryDto extends createZodDto(
  GetPaymentsQuerySchema,
) {}
