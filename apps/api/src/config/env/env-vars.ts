import { NodeEnv } from '@app/config/env/enums/node-env.enum';
import { z } from 'zod';


export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().int().positive(),
  SWAGGER_PATH: z.string().default('docs'),
  CORS_ORIGIN: z.string().default('*'),

  DATABASE_URL: z.string(),

  REDIS_URL: z.string().url(),

  BULL_BOARD_USERNAME: z.string().optional(),
  BULL_BOARD_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().default('secret'),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('1d'),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
