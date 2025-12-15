import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { getQueueToken } from '@nestjs/bullmq';
import { type TestingModule } from '@nestjs/testing';
import { type Queue } from 'bullmq';

/**
 * Helper for draining all registered BullMQ queues in tests.
 *
 * Call `close()` in your test teardown to ensure no pending jobs keep
 * Redis connections open.
 */
export class TestQueueManager {
  constructor(private readonly app: TestingModule) {}

  async close(): Promise<void> {
    await Promise.all(
      Object.values(QueueName).map(async (name) => {
        const queue = this.app.get<Queue>(getQueueToken(name));
        await queue.drain();
        await queue.close();
      }),
    );
  }
}
