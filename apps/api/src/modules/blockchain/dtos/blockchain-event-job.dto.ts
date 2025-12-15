import {
  type BlockchainEventName,
  type PaidEvent,
} from '@workspace/shared';

/**
 * Job data for processing blockchain events
 */
export type BlockchainEventJobData = {
  eventName: typeof BlockchainEventName.Paid;
  event: PaidEvent;
};
