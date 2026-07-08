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
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // TODO: 실제 이미지 호스트로 좁히기 (예: cdn.newdok.com)
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zod', 'clsx'],
  },
};

export default nextConfig;
