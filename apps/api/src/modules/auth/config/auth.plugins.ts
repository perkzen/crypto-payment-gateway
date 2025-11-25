import { type ConfigService } from '@nestjs/config';
import { generateRandomString } from 'better-auth/crypto';
import { apiKey, openAPI, siwe } from 'better-auth/plugins';
import { type VerifyMessageParameters, verifyMessage } from 'viem';

export const getAuthPlugins = (configService: ConfigService) => [
  openAPI(),
  apiKey({
    enableSessionForAPIKeys: true,
    requireName: true,
    defaultPrefix: 'cpg-',
    minimumNameLength: 3,
    startingCharactersConfig: {
      charactersLength: 10,
      shouldStore: true,
    },
  }),
  siwe({
    domain: configService.getOrThrow('SIWE_DOMAIN'),
    anonymous: true, // optional, default is true, requires to send email in body
    getNonce: async () => generateRandomString(32, 'a-z', 'A-Z', '0-9'),
    verifyMessage: async ({ message, signature, address }) => {
      try {
        return await verifyMessage({
          address,
          message,
          signature,
        } as VerifyMessageParameters);
      } catch {
        return false;
      }
    },
  }),
];
