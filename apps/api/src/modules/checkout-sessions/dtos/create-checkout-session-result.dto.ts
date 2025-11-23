import { CreateCheckoutSessionResultSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateCheckoutSessionResultDto extends createZodDto(
  CreateCheckoutSessionResultSchema,
) {}
