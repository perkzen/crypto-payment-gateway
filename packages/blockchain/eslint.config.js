import { config as baseConfig } from '@workspace/eslint-config/react-internal';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
