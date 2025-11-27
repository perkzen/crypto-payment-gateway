import { AppModule } from '@app/app.module';
import { DATABASE_OPTIONS } from '@app/modules/database/database.module-definition';
import { type ModuleMetadata } from '@nestjs/common';
import {
  Test,
  type TestingModule,
  type TestingModuleBuilder,
} from '@nestjs/testing';
import { TestDB } from '@test/common/test-db';
import { TestHttpServer } from '@test/common/test-http-server';

export type OverrideFunc = (
  module: TestingModuleBuilder,
) => TestingModuleBuilder;

export type TestBootstrapCompileOptions = {
  metadata?: ModuleMetadata;
  overrideFunc?: OverrideFunc;
  disableAppModules?: boolean;
};

export class TestAppBootstrap {
  moduleBuilder: TestingModuleBuilder;
  app: TestingModule;
  httpServer: TestHttpServer;
  db: TestDB;

  constructor() {}

  async compile(options?: TestBootstrapCompileOptions): Promise<TestingModule> {
    const {
      metadata = {},
      overrideFunc = undefined,
      disableAppModules = false,
    } = { ...options };

    if (this.moduleBuilder) {
      throw new Error(
        'TestAppBootstrap already compiled. Call close() before recompiling.',
      );
    }

    this.db = new TestDB();
    await this.db.createTestDatabase();

    this.createBuilder(metadata, overrideFunc, !disableAppModules);

    this.moduleBuilder
      .overrideProvider(DATABASE_OPTIONS)
      .useValue(this.db.getDatabaseOptions());

    this.app = await this.moduleBuilder.compile();
    this.httpServer = await TestHttpServer.createHttpServer(this.app);

    return this.app;
  }

  async close(): Promise<void> {
    if (!this.app) return;
    await this.app.close();
    if (this.db) await this.db.dropTestDatabase();
  }

  private createBuilder(
    metadata: ModuleMetadata,
    overrideFunc?: OverrideFunc,
    useAppModule: boolean = true,
  ): TestAppBootstrap {
    if (!metadata.imports) {
      metadata.imports = [];
    }

    if (useAppModule) {
      metadata.imports.push(AppModule);
    }

    this.moduleBuilder = Test.createTestingModule({ ...metadata });

    if (overrideFunc) {
      overrideFunc(this.moduleBuilder);
    }

    return this;
  }
}
