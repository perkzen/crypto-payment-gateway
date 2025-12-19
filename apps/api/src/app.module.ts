import { getEnvFilePath } from '@app/config/env/env-paths';
import { validateEnv } from '@app/config/env/env-var.validation';
import { QueueModule } from '@app/modules/queue/queue.module';
import { WalletsModule } from '@app/modules/wallets/wallets.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { CheckoutSessionsModule } from './modules/checkout-sessions/checkout-sessions.module';
import { DatabaseModule } from './modules/database/database.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { KycModule } from './modules/kyc/kyc.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.getOrThrow('DATABASE_URL'),
      }),
    }),
    QueueModule,
    BlockchainModule,
    AuthModule,
    PaymentsModule,
    CheckoutSessionsModule,
    MerchantsModule,
    ExchangeModule,
    WalletsModule,
    WebhooksModule,
    KycModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
