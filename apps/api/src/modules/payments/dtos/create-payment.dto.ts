import { CreatePaymentSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}

