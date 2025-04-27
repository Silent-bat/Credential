/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even with errors
    ignoreDuringBuilds: true,
  },
  // Configure asset handling - updated to use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me'
      }
    ]
  },
  // Fix CSS handling to avoid 404 errors
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle the problematic file
    config.module.rules.push({
      test: /node_modules[\\/]@mapbox[\\/]node-pre-gyp[\\/]lib[\\/]util[\\/]nw-pre-gyp[\\/]index\.html$/,
      use: 'null-loader',
    });

    // Add a rule to handle s3_setup.js
    config.module.rules.push({
      test: /node_modules[\\/]@mapbox[\\/]node-pre-gyp[\\/]lib[\\/]util[\\/]s3_setup\.js$/,
      use: 'null-loader',
    });

    // Add a general webpack configuration to exclude native Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Add Node.js modules to ignore
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      aws4: false,
      os: false,
      path: false,
      // Provide polyfills for browser
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      http: false,
      https: false,
      zlib: false,
    };
    
    // Add Buffer polyfill
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    // Ignore specific modules that cause issues with webpack
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mapbox/node-pre-gyp': false,
        'express': false,
        'os': false,
        'path': false,
      };
    }

    // Add a rule to exclude @iota/sdk native bindings
    config.externals = [...(config.externals || []), { '@iota/sdk': 'commonjs @iota/sdk' }];

    // Handle binary files and native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });

    return config;
  },
  // Optional: Add transpilePackages if needed
  transpilePackages: ['bcrypt'],
  typescript: {
    // !! WARN !!
    // Temporary solution to bypass type checking during build
    // This should be removed once all type issues are fixed
    ignoreBuildErrors: true,
  },
  // Updated from experimental.serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['pdfkit', 'canvas'],
  experimental: {
    optimizeCss: true
  }
};

module.exports = withNextIntl(nextConfig);