import { z } from 'zod';

export const siweVerifyBodySchema = z.object({
  walletAddress: z.string(),
  message: z.string(),
  chainId: z.number(),
  signature: z.string(),
});

export type SiweVerifyBody = z.infer<typeof siweVerifyBodySchema>;
