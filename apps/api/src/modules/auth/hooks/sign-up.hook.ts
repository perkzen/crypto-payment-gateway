import { SignUpService } from '@app/modules/auth/serivces/sign-up.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

const siweVerifyBodySchema = z.object({
  walletAddress: z.string(),
  message: z.string(),
  chainId: z.number(),
  signature: z.string(),
});

export type SiweVerifyBody = z.infer<typeof siweVerifyBodySchema>;

@Hook()
@Injectable()
export class SignUpHook {
  private readonly logger = new Logger(SignUpHook.name);

  constructor(private readonly signUpService: SignUpService) {}

  @AfterHook('/siwe/verify')
  async handle(ctx: AuthHookContext) {
    const { body } = ctx;

    const safeBody = siweVerifyBodySchema.safeParse(body);
    if (!safeBody.success) {
      this.logger.warn(`Invalid SIWE verify payload: ${JSON.stringify(body)}`);
      return;
    }

    await this.signUpService.signUp(safeBody.data);
  }
}
