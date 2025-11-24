import { DatabaseService } from '@app/modules/database/database.service';
import { checkoutSession } from '@app/modules/database/schemas';
import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { TestFactory } from '@test/common/test-factory';
import { eq } from 'drizzle-orm';
import type { CreateCheckoutSession } from '@workspace/schemas';

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
      const payload: CreateCheckoutSession = {
        amountFiat: 10000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: faker.internet.url(),
        cancelUrl: faker.internet.url(),
      };

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

      const payload: CreateCheckoutSession = {
        amountFiat: 10000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: faker.internet.url(),
        cancelUrl: faker.internet.url(),
      };

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .set('x-api-key', testApiKey.key)
        .send(payload)
        .expect(404);
    });

    it('should return 400 for invalid amount (negative)', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload: Partial<CreateCheckoutSession> = {
        amountFiat: -100,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: faker.internet.url(),
        cancelUrl: faker.internet.url(),
      };

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .set('x-api-key', apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should return 400 for invalid currency (too short)', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload: Partial<CreateCheckoutSession> = {
        amountFiat: 10000,
        fiatCurrency: 'US', // Should be 3 characters
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: faker.internet.url(),
        cancelUrl: faker.internet.url(),
      };

      await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .set('x-api-key', apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should create a checkout session successfully', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload: CreateCheckoutSession = {
        amountFiat: 10000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH', 'BTC'],
        allowedNetworks: ['ethereum', 'bitcoin'],
        successUrl: faker.internet.url(),
        cancelUrl: faker.internet.url(),
      };

      const response = await testApp.httpServer
        .request()
        .post('/checkout/sessions')
        .set('x-api-key', apiKey.key)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        status: 'open',
        checkoutUrl: expect.stringContaining('/checkout'),
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

  describe('GET /checkout/sessions/:id', () => {});
});
