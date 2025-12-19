import { DatabaseService } from '@app/modules/database/database.service';
import { webhookSubscription } from '@app/modules/database/schemas';
import { WebhookEventName } from '@workspace/shared';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { TestFactory } from '@test/common/test-factory';
import { eq } from 'drizzle-orm';

describe('Webhooks (e2e)', () => {
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

  describe('POST /webhooks/subscriptions', () => {
    it('should return 401 when not authenticated', async () => {
      const payload = {
        url: 'https://example.com/webhook',
        events: [WebhookEventName.PaymentCreated],
      };

      await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .send(payload)
        .expect(401);
    });

    it('should return 404 when user has no merchant', async () => {
      const testUser = await factory.createUser();
      const testApiKey = await factory.createApiKey(testUser.id);

      const payload = {
        url: 'https://example.com/webhook',
        events: [WebhookEventName.PaymentCreated],
      };

      await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(testApiKey.key)
        .send(payload)
        .expect(404);
    });

    it('should return 400 for invalid URL', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = {
        url: 'not-a-valid-url',
        events: [WebhookEventName.PaymentCreated],
      };

      await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should return 400 for empty events array', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = {
        url: 'https://example.com/webhook',
        events: [],
      };

      await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should return 400 for invalid event type', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = {
        url: 'https://example.com/webhook',
        events: ['invalid.event'],
      };

      await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(400);
    });

    it('should create a webhook subscription successfully', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = {
        url: 'https://example.com/webhook',
        events: [
          WebhookEventName.PaymentCreated,
          WebhookEventName.PaymentCompleted,
        ],
      };

      const response = await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        merchantId: expect.any(String),
        url: payload.url,
        events: payload.events,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify the subscription was created in the database
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);
      const createdSubscription =
        await databaseService.db.query.webhookSubscription.findFirst({
          where: eq(webhookSubscription.id, response.body.id),
        });

      expect(createdSubscription).toBeDefined();
      expect(createdSubscription?.url).toBe(payload.url);
      expect(createdSubscription?.events).toEqual(payload.events);
      expect(createdSubscription?.isActive).toBe(true);
    });

    it('should create a webhook subscription with secret', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const payload = {
        url: 'https://example.com/webhook',
        events: [WebhookEventName.PaymentCreated],
        secret: 'my-secret-key',
      };

      const response = await testApp.httpServer
        .request()
        .post('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        url: payload.url,
        events: payload.events,
      });

      // Verify secret is stored (but not returned in response for security)
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);
      const createdSubscription =
        await databaseService.db.query.webhookSubscription.findFirst({
          where: eq(webhookSubscription.id, response.body.id),
        });

      expect(createdSubscription?.secret).toBe(payload.secret);
    });
  });

  describe('GET /webhooks/subscriptions', () => {
    it('should return 401 when not authenticated', async () => {
      await testApp.httpServer
        .request()
        .get('/webhooks/subscriptions')
        .expect(401);
    });

    it('should return 404 when user has no merchant', async () => {
      const testUser = await factory.createUser();
      const testApiKey = await factory.createApiKey(testUser.id);

      await testApp.httpServer
        .request()
        .get('/webhooks/subscriptions')
        .setApiKey(testApiKey.key)
        .expect(404);
    });

    it('should return empty array when no subscriptions exist', async () => {
      const { apiKey } = await factory.createMerchantUser();

      const response = await testApp.httpServer
        .request()
        .get('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all webhook subscriptions for merchant', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      // Create multiple subscriptions
      const [sub1] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook1',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      const [sub2] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook2',
          events: [WebhookEventName.PaymentCompleted],
          isActive: true,
        })
        .returning();

      const response = await testApp.httpServer
        .request()
        .get('/webhooks/subscriptions')
        .setApiKey(apiKey.key)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: sub1.id }),
          expect.objectContaining({ id: sub2.id }),
        ]),
      );
    });

    it('should only return subscriptions for the authenticated merchant', async () => {
      const { apiKey: apiKey1, merchant: merchant1 } =
        await factory.createMerchantUser();
      const { merchant: merchant2 } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      // Create subscription for merchant1
      const [sub1] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant1.id,
          url: 'https://merchant1.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      // Create subscription for merchant2
      await databaseService.db.insert(webhookSubscription).values({
        merchantId: merchant2.id,
        url: 'https://merchant2.com/webhook',
        events: [WebhookEventName.PaymentCreated],
        isActive: true,
      });

      const response = await testApp.httpServer
        .request()
        .get('/webhooks/subscriptions')
        .setApiKey(apiKey1.key)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(sub1.id);
      expect(response.body[0].merchantId).toBe(merchant1.id);
    });
  });

  describe('PATCH /webhooks/subscriptions/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const subscriptionId = '00000000-0000-0000-0000-000000000000';

      await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${subscriptionId}`)
        .send({ url: 'https://example.com/new-webhook' })
        .expect(401);
    });

    it('should return 400 for invalid UUID format', async () => {
      const { apiKey } = await factory.createMerchantUser();

      await testApp.httpServer
        .request()
        .patch('/webhooks/subscriptions/invalid-uuid')
        .setApiKey(apiKey.key)
        .send({ url: 'https://example.com/new-webhook' })
        .expect(400);
    });

    it('should return 404 for non-existent subscription', async () => {
      const { apiKey } = await factory.createMerchantUser();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${nonExistentId}`)
        .setApiKey(apiKey.key)
        .send({ url: 'https://example.com/new-webhook' })
        .expect(404);
    });

    it('should return 404 when updating another merchant\'s subscription', async () => {
      const { merchant: merchant1 } = await factory.createMerchantUser();
      const { apiKey: apiKey2 } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      // Create subscription for merchant1
      const [sub1] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant1.id,
          url: 'https://merchant1.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      // Try to update it as merchant2
      await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${sub1.id}`)
        .setApiKey(apiKey2.key)
        .send({ url: 'https://hacked.com/webhook' })
        .expect(404);
    });

    it('should update webhook subscription URL', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      const [sub] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      const newUrl = 'https://example.com/new-webhook';

      const response = await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${sub.id}`)
        .setApiKey(apiKey.key)
        .send({ url: newUrl })
        .expect(200);

      expect(response.body.url).toBe(newUrl);

      // Verify in database
      const updated = await databaseService.db.query.webhookSubscription.findFirst(
        {
          where: eq(webhookSubscription.id, sub.id),
        },
      );
      expect(updated?.url).toBe(newUrl);
    });

    it('should update webhook subscription events', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      const [sub] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      const newEvents = [
        WebhookEventName.PaymentCreated,
        WebhookEventName.PaymentCompleted,
        WebhookEventName.PaymentFailed,
      ];

      const response = await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${sub.id}`)
        .setApiKey(apiKey.key)
        .send({ events: newEvents })
        .expect(200);

      expect(response.body.events).toEqual(newEvents);

      // Verify in database
      const updated = await databaseService.db.query.webhookSubscription.findFirst(
        {
          where: eq(webhookSubscription.id, sub.id),
        },
      );
      expect(updated?.events).toEqual(newEvents);
    });

    it('should update webhook subscription isActive status', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      const [sub] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      const response = await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${sub.id}`)
        .setApiKey(apiKey.key)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Verify in database
      const updated = await databaseService.db.query.webhookSubscription.findFirst(
        {
          where: eq(webhookSubscription.id, sub.id),
        },
      );
      expect(updated?.isActive).toBe(false);
    });

    it('should return 400 for invalid URL in update', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      const [sub] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      await testApp.httpServer
        .request()
        .patch(`/webhooks/subscriptions/${sub.id}`)
        .setApiKey(apiKey.key)
        .send({ url: 'not-a-valid-url' })
        .expect(400);
    });
  });

  describe('DELETE /webhooks/subscriptions/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const subscriptionId = '00000000-0000-0000-0000-000000000000';

      await testApp.httpServer
        .request()
        .delete(`/webhooks/subscriptions/${subscriptionId}`)
        .expect(401);
    });

    it('should return 400 for invalid UUID format', async () => {
      const { apiKey } = await factory.createMerchantUser();

      await testApp.httpServer
        .request()
        .delete('/webhooks/subscriptions/invalid-uuid')
        .setApiKey(apiKey.key)
        .expect(400);
    });

    it('should return 404 for non-existent subscription', async () => {
      const { apiKey } = await factory.createMerchantUser();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await testApp.httpServer
        .request()
        .delete(`/webhooks/subscriptions/${nonExistentId}`)
        .setApiKey(apiKey.key)
        .expect(404);
    });

    it('should return 404 when deleting another merchant\'s subscription', async () => {
      const { merchant: merchant1 } = await factory.createMerchantUser();
      const { apiKey: apiKey2 } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      // Create subscription for merchant1
      const [sub1] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant1.id,
          url: 'https://merchant1.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      // Try to delete it as merchant2
      await testApp.httpServer
        .request()
        .delete(`/webhooks/subscriptions/${sub1.id}`)
        .setApiKey(apiKey2.key)
        .expect(404);
    });

    it('should delete webhook subscription successfully', async () => {
      const { apiKey, merchant } = await factory.createMerchantUser();
      const databaseService = testApp.app.get<DatabaseService>(DatabaseService);

      const [sub] = await databaseService.db
        .insert(webhookSubscription)
        .values({
          merchantId: merchant.id,
          url: 'https://example.com/webhook',
          events: [WebhookEventName.PaymentCreated],
          isActive: true,
        })
        .returning();

      await testApp.httpServer
        .request()
        .delete(`/webhooks/subscriptions/${sub.id}`)
        .setApiKey(apiKey.key)
        .expect(204);

      // Verify deletion in database
      const deleted = await databaseService.db.query.webhookSubscription.findFirst(
        {
          where: eq(webhookSubscription.id, sub.id),
        },
      );
      expect(deleted).toBeUndefined();
    });
  });
});
