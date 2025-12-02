import { UpdatePaymentSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class UpdatePaymentDto extends createZodDto(UpdatePaymentSchema) {}
