import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'book-covers.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
        port: '',
        pathname: '/leaflet@1.9.4/dist/images/**',
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
