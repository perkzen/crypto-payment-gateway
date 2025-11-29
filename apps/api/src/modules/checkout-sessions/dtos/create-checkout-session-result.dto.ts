import { CreateCheckoutSessionResultSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateCheckoutSessionResultDto extends createZodDto(
  CreateCheckoutSessionResultSchema,
) {}
