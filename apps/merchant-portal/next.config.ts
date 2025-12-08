import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/ui'],
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    reactCompiler: true,
  },
  turbopack: {
    resolveAlias: {
      // Ignore optional dependencies that aren't needed for web builds
      // These match the webpack fallbacks above
      '@react-native-async-storage/async-storage': 'false',
      'pino-pretty': 'false',
    },
  },
  webpack: (config) => {
    // Ignore optional dependencies that aren't needed for web builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

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
