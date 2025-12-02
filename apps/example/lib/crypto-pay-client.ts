import { CryptoPayClient } from '@workspace/sdk';

let cryptoPayClient: CryptoPayClient | null = null;

export function getCryptoPayClient(apiKey?: string): CryptoPayClient {
  if (!cryptoPayClient) {
    cryptoPayClient = new CryptoPayClient({ apiKey });
  }
  return cryptoPayClient;
}
