import { BaseSetup } from '@app/config/setups/base.setup';
import { type auth } from '@app/modules/auth/config/auth';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { type AuthService } from '@thallesp/nestjs-better-auth';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export class DocsSetup extends BaseSetup {
  static readonly DOCS_PATH = '/docs';

  constructor(
    readonly app: NestExpressApplication,
    private readonly authService: AuthService<typeof auth>,
  ) {
    super(app);
  }

  async init() {
    const apiDocs = this.createDocument();
    const authDocs = await this.authService.api.generateOpenAPISchema();

    const configService = this.app.get(ConfigService);
    const PORT = configService.get('PORT');

    this.app.use(
      DocsSetup.DOCS_PATH,
      apiReference({
        pageTitle: 'Crypto payment gateway API Reference',
        sources: [
          {
            content: cleanupOpenApiDoc(apiDocs),
            title: 'Crypto payment gateway REST API',
          },
          {
            content: authDocs,
            title: 'Authentication Service API',
          },
        ],
      }),
    );

    Logger.log(
      `Documentation is available at http://localhost:${PORT}${DocsSetup.DOCS_PATH}`,
      DocsSetup.name,
    );
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
