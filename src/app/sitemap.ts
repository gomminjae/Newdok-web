import type { MetadataRoute } from 'next';
import { getPublicNewsletters } from '@/entities/newsletter/api/public-newsletter.server';
import { SITE_URL } from '@/shared/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await getPublicNewsletters();

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
