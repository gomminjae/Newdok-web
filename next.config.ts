import type { NextConfig } from "next";
import { getApiBaseUrl } from "./src/shared/config/api";
import { newsletterImagePatterns } from './src/shared/config/images';

const BACKEND_URL = getApiBaseUrl();

const nextConfig: NextConfig = {
  images: { remotePatterns: newsletterImagePatterns },
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
