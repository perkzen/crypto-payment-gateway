import { config as baseConfig } from '@workspace/eslint-config/react-internal.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
