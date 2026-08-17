import type { MetadataRoute } from 'next';
import { newsletterApi } from '@/entities/newsletter';
import { SITE_URL } from '@/shared/config/site';

// 사이트맵도 ISR로 1시간마다 재생성
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await newsletterApi
    .fetchGuestAllNewsletterBrands({})
    .catch(() => []);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/newsletters`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/newsletters/${brand.brandId}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...brandEntries];
}
