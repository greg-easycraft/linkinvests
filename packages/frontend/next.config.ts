import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@linkinvests/shared', '@linkinvests/db'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.immobilier.notaires.fr',
      },
    ],
  },
};

export default nextConfig;
