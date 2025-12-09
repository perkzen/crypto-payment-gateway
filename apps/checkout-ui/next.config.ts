import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/shared'],
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
      '@react-native-async-storage/async-storage': 'false',
      'pino-pretty': 'false',
    },
  },
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that aren't needed for web builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Ensure wagmi resolves from the app's node_modules first
    // This fixes React Context issues in monorepos where hooks from shared packages
    // might resolve wagmi from a different instance
    // We use modules array to prioritize app's node_modules while preserving subpath imports
    if (!isServer) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const appNodeModules = path.resolve(__dirname, 'node_modules');
      config.resolve.modules = [
        appNodeModules,
        ...(config.resolve.modules || ['node_modules']),
      ];
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
