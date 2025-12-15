import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/shared'],
  reactCompiler: true,
  // Mark packages as external to prevent Turbopack from processing test files
  serverExternalPackages: ['thread-stream', 'pino', 'pino-pretty'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      // Ignore optional dependencies that aren't needed for web builds
      // Turbopack requires file paths, not 'false' strings
      '@react-native-async-storage/async-storage': { browser: './empty.ts' },
      'pino-pretty': { browser: './empty.ts' },
      // Stop thread-stream test files from being bundled
      tap: { browser: './empty.ts' },
      tape: { browser: './empty.ts' },
      'why-is-node-running': { browser: './empty.ts' },
      // Keep pino from pulling in thread-stream on the browser graph
      // Apply unconditionally to prevent thread-stream from being imported
      pino: 'pino/browser',
      'thread-stream': './empty.ts',
    },
  },
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that aren't needed for web builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Mirror Turbopack aliases for webpack (client-side only)
    if (!isServer) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        pino: require.resolve('pino/browser'),
        'thread-stream': path.resolve(__dirname, 'empty.ts'),
      };
    }

    // Ignore these modules during webpack bundling
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
      {
        module: /node_modules\/pino/,
        message: /Can't resolve 'pino-pretty'/,
      },
    ];

    return config;
  },
};

export default nextConfig;
