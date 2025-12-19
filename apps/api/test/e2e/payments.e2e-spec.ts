import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { TestFactory } from '@test/common/test-factory';

describe('Payments (e2e)', () => {
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

  describe('GET /payments', () => {
    it('should return 401 when not authenticated', async () => {
      await testApp.httpServer.request().get('/payments').expect(401);
    });

    it('should return 404 when user has no merchant', async () => {
      const testUser = await factory.createUser();
      const testApiKey = await factory.createApiKey(testUser.id);

      await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(testApiKey.key)
        .expect(404);
    });

    it('should return empty paginated response when no payments exist', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const response = await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should return paginated payments with default pagination', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create 5 payments
      const payments = [];
      for (let i = 0; i < 5; i++) {
        const payment = await factory.createPayment(merchant.id, {
          createdAt: new Date(Date.now() - i * 1000), // Different timestamps for sorting
        });
        payments.push(payment);
      }

      const response = await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            merchantId: merchant.id,
            status: expect.any(String),
            network: expect.any(String),
            address: expect.any(String),
            txHash: expect.any(String),
            paidAmount: expect.any(String),
            confirmations: expect.any(Number),
            blockNumber: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        meta: {
          page: 1,
          limit: 20,
          total: 5,
          totalPages: 1,
        },
      });

      expect(response.body.data).toHaveLength(5);
    });

    it('should return payments sorted by createdAt desc by default', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create payments with different timestamps
      const now = Date.now();
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now - 2000),
      });
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now - 1000),
      });
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now),
      });

      const response = await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      // Should be sorted desc (newest first)
      const timestamps = response.body.data.map((p: { createdAt: string }) =>
        new Date(p.createdAt).getTime(),
      );
      expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
      expect(timestamps[1]).toBeGreaterThan(timestamps[2]);
    });

    it('should return payments sorted by createdAt asc when sortOrder=asc', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create payments with different timestamps
      const now = Date.now();
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now - 2000),
      });
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now - 1000),
      });
      await factory.createPayment(merchant.id, {
        createdAt: new Date(now),
      });

      const response = await testApp.httpServer
        .request()
        .get('/payments?sortOrder=asc')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      // Should be sorted asc (oldest first)
      const timestamps = response.body.data.map((p: { createdAt: string }) =>
        new Date(p.createdAt).getTime(),
      );
      expect(timestamps[0]).toBeLessThan(timestamps[1]);
      expect(timestamps[1]).toBeLessThan(timestamps[2]);
    });

    it('should filter payments by status', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create payments with different statuses
      await factory.createPayment(merchant.id, { status: 'pending' });
      await factory.createPayment(merchant.id, { status: 'pending' });
      await factory.createPayment(merchant.id, { status: 'confirmed' });
      await factory.createPayment(merchant.id, { status: 'failed' });

      const response = await testApp.httpServer
        .request()
        .get('/payments?status=pending')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      response.body.data.forEach((p: { status: string }) => {
        expect(p.status).toBe('pending');
      });
    });

    it('should handle pagination correctly', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create 25 payments
      for (let i = 0; i < 25; i++) {
        await factory.createPayment(merchant.id, {
          createdAt: new Date(Date.now() - i * 1000),
        });
      }

      // First page
      const page1 = await testApp.httpServer
        .request()
        .get('/payments?page=1&limit=10')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(page1.body.data).toHaveLength(10);
      expect(page1.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });

      // Second page
      const page2 = await testApp.httpServer
        .request()
        .get('/payments?page=2&limit=10')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(page2.body.data).toHaveLength(10);
      expect(page2.body.meta).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });

      // Third page
      const page3 = await testApp.httpServer
        .request()
        .get('/payments?page=3&limit=10')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(page3.body.data).toHaveLength(5);
      expect(page3.body.meta).toMatchObject({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
      });

      // Verify no duplicate payments across pages
      const allIds = [
        ...page1.body.data.map((p: { id: string }) => p.id),
        ...page2.body.data.map((p: { id: string }) => p.id),
        ...page3.body.data.map((p: { id: string }) => p.id),
      ];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(25);
    });

    it('should only return payments for the authenticated merchant', async () => {
      const { merchant: merchant1, apiKey: apiKey1 } =
        await factory.createMerchantUser();
      const { merchant: merchant2, apiKey: apiKey2 } =
        await factory.createMerchantUser();

      // Create payments for both merchants
      await factory.createPayment(merchant1.id);
      await factory.createPayment(merchant1.id);
      await factory.createPayment(merchant2.id);
      await factory.createPayment(merchant2.id);
      await factory.createPayment(merchant2.id);

      // Request as merchant1
      const response1 = await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(apiKey1.key)
        .expect(200);

      expect(response1.body.data).toHaveLength(2);
      expect(response1.body.meta.total).toBe(2);
      response1.body.data.forEach((p: { merchantId: string }) => {
        expect(p.merchantId).toBe(merchant1.id);
      });

      // Request as merchant2
      const response2 = await testApp.httpServer
        .request()
        .get('/payments')
        .setApiKey(apiKey2.key)
        .expect(200);

      expect(response2.body.data).toHaveLength(3);
      expect(response2.body.meta.total).toBe(3);
      response2.body.data.forEach((p: { merchantId: string }) => {
        expect(p.merchantId).toBe(merchant2.id);
      });
    });

    it('should combine status filter with pagination', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create 15 pending and 10 confirmed payments
      for (let i = 0; i < 15; i++) {
        await factory.createPayment(merchant.id, { status: 'pending' });
      }
      for (let i = 0; i < 10; i++) {
        await factory.createPayment(merchant.id, { status: 'confirmed' });
      }

      const response = await testApp.httpServer
        .request()
        .get('/payments?status=pending&page=1&limit=10')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });

      response.body.data.forEach((p: { status: string }) => {
        expect(p.status).toBe('pending');
      });
    });

    it('should validate query parameters', async () => {
      const { apiKey } = await factory.createMerchantUser();

      // Invalid page (must be >= 1)
      await testApp.httpServer
        .request()
        .get('/payments?page=0')
        .setApiKey(apiKey.key)
        .expect(400);

      // Invalid limit (must be >= 1)
      await testApp.httpServer
        .request()
        .get('/payments?limit=0')
        .setApiKey(apiKey.key)
        .expect(400);

      // Invalid limit (must be <= 100)
      await testApp.httpServer
        .request()
        .get('/payments?limit=101')
        .setApiKey(apiKey.key)
        .expect(400);

      // Invalid status
      await testApp.httpServer
        .request()
        .get('/payments?status=invalid')
        .setApiKey(apiKey.key)
        .expect(400);

      // Invalid sortOrder
      await testApp.httpServer
        .request()
        .get('/payments?sortOrder=invalid')
        .setApiKey(apiKey.key)
        .expect(400);
    });

    it('should handle edge case: empty page beyond total pages', async () => {
      const { merchant, apiKey } = await factory.createMerchantUser();

      // Create only 5 payments
      for (let i = 0; i < 5; i++) {
        await factory.createPayment(merchant.id);
      }

      // Request page 10 (beyond available pages)
      const response = await testApp.httpServer
        .request()
        .get('/payments?page=10&limit=10')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta).toMatchObject({
        page: 10,
        limit: 10,
        total: 5,
        totalPages: 1,
      });
    });
  });
});
