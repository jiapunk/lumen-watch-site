import type { NextConfig } from 'next';

const isPages = process.env.PAGES_BUILD === '1';

const nextConfig: NextConfig = isPages
  ? {
      output: 'export',
      basePath: '/lumen-watch-site',
      assetPrefix: '/lumen-watch-site',
      trailingSlash: true,
    }
  : {};

export default nextConfig;
