import { type Config, defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export const config = defineConfig({
  out: 'src/contracts/generated.ts',
  contracts: [],
  plugins: [
    hardhat({
      project: '../../apps/blockchain',
      exclude: ['**/Mock*.sol/**', '**/*.t.sol/**'],
    }),
    react(),
  ],
}) as Config;
