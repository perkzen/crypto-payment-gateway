import { ExchangeRateSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class ExchangeRateDto extends createZodDto(ExchangeRateSchema) {}
