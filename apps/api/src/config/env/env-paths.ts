import { type NodeEnv } from '@app/config/env/enums/node-env.enum';

const envFilePaths: Record<NodeEnv, string> = {
  development: '.env.local',
  production: '.env',
  test: '.env.test',
} as const;

export const getEnvFilePath = () => {
  return envFilePaths[process.env.NODE_ENV] ?? '.env';
};
