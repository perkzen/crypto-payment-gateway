import { type getAuthConfig } from '@app/modules/auth/config/auth';
import { DatabaseService } from '@app/modules/database/database.service';
import { merchant, user, walletAddress } from '@app/modules/database/schemas';
import { faker } from '@faker-js/faker';
import { type TestingModule } from '@nestjs/testing';
import { AuthService } from '@thallesp/nestjs-better-auth';

export class TestFactory {
  private readonly db: DatabaseService['db'];
  private readonly authService: AuthService<ReturnType<typeof getAuthConfig>>;

  constructor(app: TestingModule) {
    const databaseService = app.get<DatabaseService>(DatabaseService);
    this.db = databaseService.db;
    this.authService = app.get(AuthService);
  }

  /**
   * Create a test user
   */
  async createUser(overrides?: {
    id?: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
  }) {
    const userId = overrides?.id || faker.string.uuid();
    const [testUser] = await this.db
      .insert(user)
      .values({
        id: userId,
        name: overrides?.name || faker.person.fullName(),
        email: overrides?.email || faker.internet.email(),
        emailVerified: overrides?.emailVerified ?? true,
      })
      .returning();

    return testUser;
  }

  /**
   * Create a test merchant for a user
   */
  async createMerchant(
    userId: string,
    overrides?: {
      displayName?: string;
      contactEmail?: string;
    },
  ) {
    const [testMerchant] = await this.db
      .insert(merchant)
      .values({
        userId,
        displayName: overrides?.displayName || faker.company.name(),
        contactEmail: overrides?.contactEmail || faker.internet.email(),
      })
      .returning();

    return testMerchant;
  }

  /**
   * Create a test API key for a user using better-auth service
   */
  async createApiKey(
    userId: string,
    overrides?: {
      name?: string;
    },
  ) {
    const name = overrides?.name || faker.lorem.words(2);

    return await this.authService.api.createApiKey({
      body: {
        name,
        userId,
      },
    });
  }

  /**
   * Create a test wallet address for a user
   */
  async createWalletAddress(
    userId: string,
    overrides?: {
      address?: string;
      chainId?: number;
      isPrimary?: boolean;
    },
  ) {
    const [testWalletAddress] = await this.db
      .insert(walletAddress)
      .values({
        id: faker.string.uuid(),
        userId,
        address: overrides?.address || faker.finance.ethereumAddress(),
        chainId: overrides?.chainId ?? 1,
        isPrimary: overrides?.isPrimary ?? false,
        createdAt: new Date(),
      })
      .returning();

    return testWalletAddress;
  }

  /**
   * Create a merchant user with API key (convenience method)
   * Creates a user, merchant, API key, and primary wallet address in one call
   */
  async createMerchantUser(overrides?: {
    userName?: string;
    userEmail?: string;
    merchantName?: string;
    apiKeyName?: string;
    walletAddress?: string;
    chainId?: number;
  }) {
    const testUser = await this.createUser({
      name: overrides?.userName,
      email: overrides?.userEmail,
    });

    const testMerchant = await this.createMerchant(testUser.id, {
      displayName: overrides?.merchantName,
    });

    const testApiKey = await this.createApiKey(testUser.id, {
      name: overrides?.apiKeyName,
    });

    const testWalletAddress = await this.createWalletAddress(testUser.id, {
      address: overrides?.walletAddress,
      chainId: overrides?.chainId,
      isPrimary: true,
    });

    return {
      user: testUser,
      merchant: testMerchant,
      apiKey: testApiKey,
      walletAddress: testWalletAddress,
    };
  }
}
