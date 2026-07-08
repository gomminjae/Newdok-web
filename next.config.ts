import type { NextConfig } from "next";

const BACKEND_URL = process.env.API_INTERNAL_URL ?? "http://3.38.79.19";
const BACKEND_HOST = new URL(BACKEND_URL).hostname;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: BACKEND_HOST },
    ],
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zod', 'clsx'],
  },
};

export default nextConfig;
