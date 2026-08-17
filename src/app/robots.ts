import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/config/site';

const isProduction = process.env.NODE_ENV === 'production' && process.env.ALLOW_INDEXING === 'true';

export default function robots(): MetadataRoute.Robots {
  // 개발/스테이징: 전체 차단, 프로덕션: 선택적 허용
  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: ['/'] }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/newsletters'],
        disallow: [
          '/home',
          '/mypage',
          '/bookmarks',
          '/search',
          '/explore',
          '/articles',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
