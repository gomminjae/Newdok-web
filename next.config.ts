import type { NextConfig } from "next";
import { getApiBaseUrl } from "./src/shared/config/api";
import { newsletterImagePatterns } from './src/shared/config/images';
import { getAppEnvironment } from './src/shared/config/environment';

const BACKEND_URL = getApiBaseUrl();

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_ENV: getAppEnvironment() },
  images: { remotePatterns: newsletterImagePatterns },
  async redirects() {
    return [
      { source: '/search/newsletters', destination: '/search', permanent: false },
      ...['tab', 'industry', 'day', 'orderOpt'].map((key) => ({
        source: '/search',
        has: [{ type: 'query' as const, key }],
        missing: [{ type: 'query' as const, key: 'q' }],
        destination: '/explore',
        permanent: false,
      })),
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zod', 'clsx'],
  },
};

export default nextConfig;
