import { BaseSetup } from '@app/config/setups/base.setup';
import { type NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export class MiddlewareSetup extends BaseSetup {
  constructor(protected readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void | Promise<void> {
    this.setupHelmet();
    this.setupCors();
    this.setupCompression();
    this.setupShutdownHooks();
    this.setupCookieParser();
    this.logger.log('Middleware setup completed!');
  }

  private setupHelmet() {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://cdn.jsdelivr.net",
              "https://unpkg.com",
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
      }),
    );
  }

  private setupCors() {
    this.app.enableCors({
      origin: this.configService.getOrThrow('CORS_ORIGIN'),
      credentials: true,
    });
  }

  private setupCompression() {
    this.app.use(compression());
  }

  private setupShutdownHooks(): void {
    this.app.enableShutdownHooks();
  }

  private setupCookieParser() {
    this.app.use(cookieParser());
  }
}
