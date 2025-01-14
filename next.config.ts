import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'book-covers.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '**',
        search: ''
      }
    ]
  }
};

export default nextConfig;
