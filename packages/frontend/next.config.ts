import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@linkinvest/shared', '@linkinvest/db'],
};

export default nextConfig;
