import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { isServer, webpack }: { isServer: boolean, webpack: any }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'),
      };

      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': 'sodium-javascript',
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};

export default nextConfig;
