import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable full static export
  output: 'export',

  // Security headers must be configured at the web server/CDN level for static sites
  // Headers configuration is not compatible with static export

  images: {
    // Required for static export
    unoptimized: true,
    // Allow images from specific external domains only (security hardening)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn11.bigcommerce.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'resizing.flixster.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
    // Set minimum cache TTL to 31 days (2678400 seconds) for better caching
    minimumCacheTTL: 2678400,
    // Limit image formats to the most efficient one
    formats: ['image/webp'],
    // Define breakpoints for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Webpack configuration to exclude demo/development pages from production
  webpack: (config, { dev }) => {
    // Only apply exclusions in production builds
    if (!dev) {
      // Use null-loader to replace demo/example files with empty modules
      config.module.rules.push({
        test: /.*Demo\.tsx$/,
        use: 'null-loader',
      });

      config.module.rules.push({
        test: /.*Example\.tsx$/,
        use: 'null-loader',
      });
    }

    return config;
  },
};

export default nextConfig;
