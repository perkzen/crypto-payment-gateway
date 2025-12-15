import { UpdateCheckoutSessionSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class UpdateCheckoutSessionDto extends createZodDto(
  UpdateCheckoutSessionSchema,
) {}
