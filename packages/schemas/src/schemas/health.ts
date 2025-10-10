import { z } from 'zod';

export const healthCheckSchema = z.object({
  status: z
    .string()
    .describe('Health status of the application, e.g., "ok" or "error"'),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;

// Export with the same name for backward compatibility
export const HealthCheckSchema = healthCheckSchema;
