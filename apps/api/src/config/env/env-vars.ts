import { NodeEnv } from '@app/config/env/enums/node-env.enum';
import { z } from 'zod';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().int().positive(),

  CORS_ORIGIN: z.string().default('*'),

  CHECKOUT_URL: z.string().url().default('http://localhost:3001'),

  SIWE_DOMAIN: z.string().default('localhost:3000'),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  BULL_BOARD_USERNAME: z.string().optional(),
  BULL_BOARD_PASSWORD: z.string().optional(),

  BLOCKCHAIN_RPC_URL: z.string().url().default('http://localhost:8545'),

  CRYPTO_PAY_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
