import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable full static export
  output: 'export',

  // Security headers must be configured at the web server/CDN level for static sites
  // Headers configuration is not compatible with static export

  images: {
    // Required for static export
    unoptimized: true,
    // Allow images from any external domain (personal project)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
        search: '',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '**',
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
};

export default nextConfig;
