import { GetExchangeRateQuerySchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class GetExchangeRateQueryDto extends createZodDto(
  GetExchangeRateQuerySchema,
) {}

