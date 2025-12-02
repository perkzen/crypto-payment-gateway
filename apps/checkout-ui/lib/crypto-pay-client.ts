import { CryptoPayClient } from '@workspace/sdk';

let cryptoPayClient: CryptoPayClient | null = null;

export function getCryptoPayClient(): CryptoPayClient {
  if (!cryptoPayClient) {
    cryptoPayClient = new CryptoPayClient({});
  }
  return cryptoPayClient;
}
