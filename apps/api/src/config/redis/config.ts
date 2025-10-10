import { type ConfigService } from '@nestjs/config';
import { type RedisOptions } from 'bullmq';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  return {
    url: configService.get('REDIS_URL'),
  };
};
