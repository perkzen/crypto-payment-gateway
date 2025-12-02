import { z } from 'zod';
import type { CryptoTicker, FiatTicker } from '../types/exchange';

export const ExchangeRateSchema = z.object({
  rate: z.number().positive().describe('The exchange rate for the given pair'),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

const CryptoTickerEnum = z.enum(['ETH'] satisfies [CryptoTicker]);
const FiatTickerEnum = z.enum(['USD', 'EUR'] satisfies [
  FiatTicker,
  ...FiatTicker[],
]);

export const GetExchangeRateQuerySchema = z.object({
  pair: z
    .string()
    .regex(/^ETH,(USD|EUR)$/, 'Pair must be in format ETH,USD or ETH,EUR')
    .transform((val): { crypto: CryptoTicker; fiat: FiatTicker } => {
      const [crypto, fiat] = val.split(',');
      return {
        crypto: CryptoTickerEnum.parse(crypto),
        fiat: FiatTickerEnum.parse(fiat),
      };
    }),
});

export type GetExchangeRateQuery = z.infer<typeof GetExchangeRateQuerySchema>;
