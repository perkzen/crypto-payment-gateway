import { CreateCheckoutSessionSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateCheckoutSessionDto extends createZodDto(
  CreateCheckoutSessionSchema,
) {}
