import { MerchantStatsSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class MerchantStatsDto extends createZodDto(MerchantStatsSchema) {}
