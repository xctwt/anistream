import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['s4.anilist.co'], // Allow images from AniList CDN
  },
  webpack: (config, { isServer }) => {
    // Server specific configuration
    if (isServer) {
      // Exclude WebTorrent and related modules from server-side rendering
      config.externals = [...(config.externals || []), 'webtorrent', 'k-rpc-socket', 'bittorrent-dht'];
    }

    // Only apply these polyfills in the client-side builds
    if (!isServer) {
      // NodeJS polyfills needed for WebTorrent
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dgram: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
        zlib: require.resolve('browserify-zlib'),
      };

      // Add buffer polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
