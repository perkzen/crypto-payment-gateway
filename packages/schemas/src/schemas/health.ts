import { z } from 'zod';

export const HealthCheckSchema = z.object({
  status: z
    .string()
    .describe('Health status of the application, e.g., "ok" or "error"'),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;
