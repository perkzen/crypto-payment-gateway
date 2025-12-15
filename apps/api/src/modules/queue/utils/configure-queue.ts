import { type QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import type { DynamicModule } from '@nestjs/common';

export const configureQueue = (queues: QueueName[]): DynamicModule[] => {
  return [
    BullModule.registerQueue(...queues.map((queue) => ({ name: queue }))),
    BullBoardModule.forFeature(
      ...queues.map((queue) => ({
        name: queue,
        adapter: BullMQAdapter,
      })),
    ),
  ];
};
