import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession } from '@app/modules/database/schemas';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { TestFactory } from '@test/common/test-factory';
import { createCheckoutSessionFixture } from '@test/fixtures/checkout-session';
import { eq } from 'drizzle-orm';

describe('Checkout Sessions (e2e)', () => {
  let testApp: TestAppBootstrap;
  let factory: TestFactory;

  beforeAll(async () => {
    testApp = new TestAppBootstrap();
    await testApp.compile();
    factory = new TestFactory(testApp.app);
  });

  afterAll(async () => {
    await testApp.close();
  });

  describe('POST /checkout/sessions', () => {
    // Authentication Errors (First)
    it('should return 401 when not authenticated', async () => {
      const payload = createCheckoutSessionFixture();

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .send(payload)
        .expect(401);
    });

    it('should return 404 when user has no merchant', async () => {
      // Create a user with API key but no merchant
      const testUser = await factory.createUser();
      const testApiKey = await factory.createApiKey(testUser.id);

      const payload = createCheckoutSessionFixture();

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(testApiKey.key)
        .send(payload)
        .expect(404);
    });

    it('should return 400 for invalid amount (negative)', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = createCheckoutSessionFixture({
        amountFiat: -100,
      });

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should return 400 for invalid currency (too short)', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = createCheckoutSessionFixture({
        fiatCurrency: 'US', // Should be 3 characters
      });

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should create a checkout session successfully', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = createCheckoutSessionFixture({
        allowedCryptoCurrencies: ['ETH', 'BTC'],
        allowedNetworks: ['ethereum', 'bitcoin'],
      });

      const response = await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        checkoutUrl: expect.any(String),
        expiresAt: expect.any(String), // Date is serialized to ISO string in JSON
      });

      // Verify the session was created in the database
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);
      const createdSession =
        await databaseService.db.query.checkoutSession.findFirst({
          where: eq(checkoutSession.id, response.body.id),
        });

      expect(createdSession).toBeDefined();
      expect(createdSession?.merchantId).toBeDefined();
    });
  });

  describe('GET /checkout/sessions/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      await testApp.httpServer
        .request()
        .get('/checkout/sessions/invalid-uuid')
        .expect(400);
    });

    it('should return 404 for non-existent checkout session', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await testApp.httpServer
        .request()
        .get(`/checkout/sessions/${nonExistentId}`)
        .expect(404);
    });

    it('should return checkout session successfully', async () => {
      // Create a checkout session first
      const { apiKey } = await factory.createMerchantUser();
      const payload = createCheckoutSessionFixture();

      const createResponse = await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(201);

      const sessionId = createResponse.body.id;

      // Get the checkout session
      const getResponse = await testApp.httpServer
        .request()
        .get(`/checkout/sessions/${sessionId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: sessionId,
        amountFiat: payload.amountFiat,
        fiatCurrency: payload.fiatCurrency,
        allowedCryptoCurrencies: payload.allowedCryptoCurrencies,
        allowedNetworks: payload.allowedNetworks,
        expiresAt: expect.any(String),
      });

      // Verify expiresAt is a valid ISO string
      expect(() => new Date(getResponse.body.expiresAt)).not.toThrow();
    });

    it('should return checkout session without authentication (public endpoint)', async () => {
      // Create a checkout session first
      const { apiKey } = await factory.createMerchantUser();
      const payload = createCheckoutSessionFixture();

      const createResponse = await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(201);

      const sessionId = createResponse.body.id;

      // Get the checkout session without any authentication
      const getResponse = await testApp.httpServer
        .request()
        .get(`/checkout/sessions/${sessionId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(sessionId);
    });
  });
});
