import { beforeAll, describe, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';

describe('AppController (e2e)', () => {
  let app: TestAppBootstrap;

  beforeAll(async () => {
    app = new TestAppBootstrap();
    await app.compile();
  });

  it('/health (GET)', () => {
    return app.httpServer
      .request()
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
