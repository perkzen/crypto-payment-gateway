import { BaseSetup } from '@app/config/setups/base.setup';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export class SwaggerSetup extends BaseSetup {
  constructor(readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void {
    const openApiDoc = this.createDocument();

    SwaggerModule.setup(
      this.configService.getOrThrow('SWAGGER_PATH'),
      this.app,
      cleanupOpenApiDoc(openApiDoc),
    );
    this.logger.log('Swagger setup completed!');
  }

  private createDocument() {
    const config = new DocumentBuilder()
      .setTitle('Crypto payment gateway REST API')
      .setDescription(
        'The REST API documentation for the Crypto payment gateway service',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    return SwaggerModule.createDocument(this.app, config);
  }
}
