/**
 * Block confirmation job types
 */
export const BlockConfirmationJobType = {
  ProcessBlock: 'process-block',
  ProcessConfirmation: 'process-confirmation',
} as const;

export type BlockConfirmationJobType =
  (typeof BlockConfirmationJobType)[keyof typeof BlockConfirmationJobType];

/**
 * Job data for processing a new block
 */
export type ProcessBlockJobData = {
  jobType: typeof BlockConfirmationJobType.ProcessBlock;
  blockNumber: string; // bigint as string for serialization
};

/**
 * Job data for processing block confirmations
 */
export type ProcessConfirmationJobData = {
  jobType: typeof BlockConfirmationJobType.ProcessConfirmation;
  paymentId: string;
  currentBlockNumber: string; // bigint as string for serialization
  txHash: string;
  transactionBlockNumber: string; // bigint as string for serialization
};

/**
 * Union type for all block confirmation job data
 */
export type BlockConfirmationJobData =
  | ProcessBlockJobData
  | ProcessConfirmationJobData;
