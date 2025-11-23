import { CreateCheckoutSessionSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateCheckoutSessionsDto extends createZodDto(
  CreateCheckoutSessionSchema,
) {}
