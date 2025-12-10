import { getRedisConfig } from '@app/config/redis/config';
import { BullBoardSetup } from '@app/config/setups/bull-board.setup';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: BullBoardSetup.BULL_BOARD_PATH,
      adapter: ExpressAdapter,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = getRedisConfig(configService);

        return {
          connection: redisConfig,
        };
      },
    }),
  ],
})
export class QueueModule {}
