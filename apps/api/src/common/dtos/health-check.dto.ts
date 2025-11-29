import { HealthCheckSchema } from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class HealthCheckDto extends createZodDto(HealthCheckSchema) {}
