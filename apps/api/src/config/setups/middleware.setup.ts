import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { BaseSetup } from '@app/config/setups/base.setup';
import { Reflector } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

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
    this.setupGlobalPipes();
    this.setupGlobalInterceptors();
    this.setupGlobalFilters();
    this.logger.log('Middleware setup completed!');
  }

  private setupHelmet() {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'", // Required for WebAssembly in Scalar
              'https://cdn.jsdelivr.net',
              'https://unpkg.com',
            ],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: [
              "'self'",
              'https://cdn.jsdelivr.net', // Required for source maps
            ],
            fontSrc: [
              "'self'",
              'https://cdn.jsdelivr.net',
              'https://fonts.scalar.com', // Required for Scalar fonts
            ],
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
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ],
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

  private setupGlobalPipes() {
    this.app.useGlobalPipes(new ZodValidationPipe());
  }

  private setupGlobalInterceptors() {
    const reflector = this.app.get(Reflector);
    this.app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ZodSerializerInterceptor(reflector),
    );
  }

  private setupGlobalFilters() {
    this.app.useGlobalFilters(new HttpExceptionFilter());
  }
}
