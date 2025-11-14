import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@linkinvests/shared', '@linkinvests/db'],
  output: 'standalone',
};

export default nextConfig;
