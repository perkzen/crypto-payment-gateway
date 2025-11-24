import { MiddlewareSetup } from '@app/config/setups/middleware.setup';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { type TestingModule } from '@nestjs/testing';
import request, { type Test as SuperTestTest } from 'supertest';
import type TestAgent from 'supertest/lib/agent';

export class TestHttpServer {
  httpServer: NestExpressApplication;

  constructor(private readonly testingModule: TestingModule) {
    this.httpServer = this.testingModule.createNestApplication<NestExpressApplication>({
      logger: false,
    });
  }

  static async createHttpServer(testingModule: TestingModule): Promise<TestHttpServer> {
    const instance = new TestHttpServer(testingModule);
    new MiddlewareSetup(instance.httpServer).init();
    await instance.httpServer.init();
    return instance;
  }

  request(): TestAgent<SuperTestTest> {
    if (!this.httpServer) {
      throw new Error('Http server not initialized');
    }

    return request(this.httpServer.getHttpServer());
  }
}