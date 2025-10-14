import { loadEnv } from '@app/config/env/dotenv';
import { BullBoardSetup } from '@app/config/setups/bull-board.setup';
import { DocsSetup } from '@app/config/setups/docs.setup';
import { MiddlewareSetup } from '@app/config/setups/middleware.setup';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);

  new MiddlewareSetup(app).init();
  new BullBoardSetup(app).init();
  await new DocsSetup(app).init();

  const PORT = configService.get('PORT');

  await app.listen(PORT);
}

(async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (e) {
    Logger.error(e, 'Error');
  }
})();
