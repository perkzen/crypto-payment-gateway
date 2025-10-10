import { HealthCheckSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class HealthCheckDto extends createZodDto(HealthCheckSchema) {}
