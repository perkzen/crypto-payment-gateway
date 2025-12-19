import { createApiClient } from './api-config';

export function getCryptoPayClient(apiKey?: string) {
  return createApiClient(apiKey);
}
