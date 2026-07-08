import type { NextConfig } from "next";

const BACKEND_URL = process.env.API_INTERNAL_URL ?? "http://3.38.79.19";

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
