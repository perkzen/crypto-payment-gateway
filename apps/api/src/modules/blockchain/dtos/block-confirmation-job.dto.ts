/**
 * Block confirmation job types
 */
export const BlockConfirmationJobType = {
  ProcessConfirmation: 'process-confirmation',
} as const;

export type BlockConfirmationJobType =
  (typeof BlockConfirmationJobType)[keyof typeof BlockConfirmationJobType];

/**
 * Job data for processing block confirmations
 */
export type BlockConfirmationJobData = {
  jobType: typeof BlockConfirmationJobType.ProcessConfirmation;
  paymentId: string;
  currentBlockNumber: string; // bigint as string for serialization
  txHash: string;
  transactionBlockNumber: string; // bigint as string for serialization
};
