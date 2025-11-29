import { ExchangeService } from '@app/modules/exchange/exchange.service';
import { BinanceExchangeStrategy } from '@app/modules/exchange/strategies/binance-exchange.strategy';
import { EXCHANGE } from '@app/modules/exchange/strategies/exchange.strategy';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';

@Module({
  imports: [HttpModule],
  controllers: [ExchangeController],
  providers: [
    { provide: EXCHANGE, useClass: BinanceExchangeStrategy },
    ExchangeService,
  ],
  exports: [ExchangeService],
})
export class ExchangeModule {}
