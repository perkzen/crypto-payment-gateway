import { NodeEnv } from '@app/config/env/enums/node-env.enum';
import { z } from 'zod';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().int().positive(),

  CORS_ORIGIN: z.string().default('*'),

  CHECKOUT_URL: z.string().url().default('http://localhost:3000/checkout'),

  SIWE_DOMAIN: z.string().default('localhost:3000'),

  DATABASE_URL: z.string(),

  REDIS_URL: z.string().url(),

  BULL_BOARD_USERNAME: z.string().optional(),
  BULL_BOARD_PASSWORD: z.string().optional(),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
