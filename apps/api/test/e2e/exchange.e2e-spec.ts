import { EXCHANGE } from '@app/modules/exchange/strategies/exchange.strategy';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { ExchangeStrategyMock } from '@test/mocks/exchange-strategy.mock';

describe('Exchange (e2e)', () => {
  let testApp: TestAppBootstrap;

  beforeAll(async () => {
    testApp = new TestAppBootstrap();
    await testApp.compile({
      overrideFunc: (builder) =>
        // Override the exchange strategy with a mock to avoid hitting real APIs
        builder.overrideProvider(EXCHANGE).useClass(ExchangeStrategyMock),
    });
  });

  afterAll(async () => {
    await testApp.close();
  });

  describe('GET /exchange/price', () => {
    it('should return 400 for missing pair parameter', async () => {
      await testApp.httpServer.request().get('/exchange/price').expect(400);
    });

    it('should return 400 for invalid pair format (wrong separator)', async () => {
      await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH-USD')
        .expect(400);
    });

    it('should return 400 for invalid pair format (wrong crypto)', async () => {
      await testApp.httpServer
        .request()
        .get('/exchange/price?pair=BTC,USD')
        .expect(400);
    });

    it('should return 400 for invalid pair format (wrong fiat)', async () => {
      await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH,XYZ')
        .expect(400);
    });

    it('should return 400 for invalid pair format (empty)', async () => {
      await testApp.httpServer
        .request()
        .get('/exchange/price?pair=')
        .expect(400);
    });

    it('should return 400 for invalid pair format (only crypto)', async () => {
      await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH')
        .expect(400);
    });

    it('should return exchange rate for ETH,USD successfully', async () => {
      const response = await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH,USD')
        .expect(200);

      expect(response.body).toMatchObject({
        rate: expect.any(Number),
      });

      expect(response.body.rate).toBeGreaterThan(0);
    });

    it('should return exchange rate for ETH,EUR successfully', async () => {
      const response = await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH,EUR')
        .expect(200);

      expect(response.body).toMatchObject({
        rate: expect.any(Number),
      });

      expect(response.body.rate).toBeGreaterThan(0);
    });

    it('should return exchange rate without authentication (public endpoint)', async () => {
      const response = await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH,USD')
        .expect(200);

      expect(response.body).toHaveProperty('rate');
      expect(typeof response.body.rate).toBe('number');
    });

    it('should return the mocked exchange rate value', async () => {
      const response = await testApp.httpServer
        .request()
        .get('/exchange/price?pair=ETH,USD')
        .expect(200);

      // The mock returns 1000
      expect(response.body.rate).toBe(1000);
    });
  });
});
