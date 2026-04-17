import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Don't bundle better-sqlite3 (native addon, only needed locally)
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
