import { getEnvFilePath } from '@app/config/env/env-paths';
import { validateEnv } from '@app/config/env/env-var.validation';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CheckoutSessionsModule } from './modules/checkout-sessions/checkout-sessions.module';
import { DatabaseModule } from './modules/database/database.module';
import { PaymentsModule } from './modules/payments/payments.module';

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
        connectionString: configService.get('DATABASE_URL'),
      }),
    }),
    AuthModule,
    PaymentsModule,
    CheckoutSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
