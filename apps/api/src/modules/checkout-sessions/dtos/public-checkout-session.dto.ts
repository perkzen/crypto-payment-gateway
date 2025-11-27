import { PublicCheckoutSessionSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class PublicCheckoutSessionDto extends createZodDto(
  PublicCheckoutSessionSchema,
) {}
