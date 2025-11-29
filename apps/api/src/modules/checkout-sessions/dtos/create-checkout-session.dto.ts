import { CreateCheckoutSessionSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateCheckoutSessionDto extends createZodDto(
  CreateCheckoutSessionSchema,
) {}
