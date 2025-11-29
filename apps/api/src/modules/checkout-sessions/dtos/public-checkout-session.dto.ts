import { PublicCheckoutSessionSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class PublicCheckoutSessionDto extends createZodDto(
  PublicCheckoutSessionSchema,
) {}
