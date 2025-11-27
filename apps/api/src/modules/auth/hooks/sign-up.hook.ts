import { maskWalletAddress } from '@app/common/utils/mask-wallet-address';
import { siweVerifyBodySchema } from '@app/modules/auth/dtos/siwe-verify.dto';
import { SignUpService } from '@app/modules/auth/services/sign-up.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';

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
      // Log validation errors without exposing sensitive data
      const errors = safeBody.error.errors.map((err) => ({
        path: err.path.join('.'),
        code: err.code,
      }));
      const walletAddress =
        typeof body === 'object' && body !== null && 'walletAddress' in body
          ? String(body.walletAddress)
          : undefined;

      this.logger.warn(
        `Invalid SIWE verify payload for wallet ${walletAddress ? maskWalletAddress(walletAddress) : 'unknown'}: validation errors: ${JSON.stringify(errors)}`,
      );
      return;
    }

    await this.signUpService.signUp(safeBody.data);
  }
}
