import {
  type BlockchainEventName,
  type PaidNativeEvent,
  type PaidTokenEvent,
} from '@workspace/shared';

/**
 * Job data for processing blockchain events
 */
export type BlockchainEventJobData =
  | {
      eventName: typeof BlockchainEventName.PaidNative;
      event: PaidNativeEvent;
    }
  | {
      eventName: typeof BlockchainEventName.PaidToken;
      event: PaidTokenEvent;
    };
