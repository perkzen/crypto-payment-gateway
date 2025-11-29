import { ExchangeService } from '@app/modules/exchange/exchange.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { type Tickers } from '@workspace/shared';
import { ZodResponse } from 'nestjs-zod';
import { ExchangeRateDto, GetExchangeRateQueryDto } from './dtos';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @ApiOperation({ summary: 'Get Exchange Rate' })
  @ZodResponse({
    type: ExchangeRateDto,
    status: 200,
    description: 'Exchange rate retrieved successfully',
  })
  @AllowAnonymous()
  @Get('price')
  async getExchangeRate(@Query() query: GetExchangeRateQueryDto) {
    const tickers: Tickers = [query.pair.crypto, query.pair.fiat];
    const rate = await this.exchangeService.getExchangeRate(tickers);
    return { rate };
  }
}
