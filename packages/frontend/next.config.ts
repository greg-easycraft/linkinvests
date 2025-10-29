import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@linkinvests/shared', '@linkinvests/db'],
};

export default nextConfig;
