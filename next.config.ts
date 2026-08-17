import type { NextConfig } from "next";
import { TEST_API_BASE_URL } from "./src/shared/config/api";

const BACKEND_URL = process.env.API_INTERNAL_URL ?? TEST_API_BASE_URL;

const nextConfig: NextConfig = {
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
