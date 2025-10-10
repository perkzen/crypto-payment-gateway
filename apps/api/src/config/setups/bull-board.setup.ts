import { BaseSetup } from '@app/config/setups/base.setup';
import { type NestExpressApplication } from '@nestjs/platform-express';

export class BullBoardSetup extends BaseSetup {
  static readonly BULL_BOARD_PATH = '/bull-board';

  constructor(protected readonly app: NestExpressApplication) {
    super(app);
  }

  init() {
    this.logger.log(
      `Access Bull Board at http://localhost:8000${BullBoardSetup.BULL_BOARD_PATH}`,
      BullBoardSetup.name,
    );
  }
}
