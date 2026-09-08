import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { newsletterApi } from '@/entities/newsletter';
import { ApiError } from '@/shared/api/client';
import { BrandDetailClient } from './BrandDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

// ISR: 1시간마다 백그라운드 재검증
export const revalidate = 3600;

// 빌드 시 인기 브랜드를 미리 생성. 그 외 브랜드는 첫 요청 시 온디맨드 생성 후 캐시.
export async function generateStaticParams() {
  try {
    const brands = await newsletterApi.fetchGuestAllNewsletterBrands({
      orderOpt: '인기순',
    });
    return brands.slice(0, 50).map((b) => ({ id: String(b.brandId) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const brand = await newsletterApi.fetchGuestNewsletterBrand(Number(id));

    return {
      title: `${brand.brandName} | Newdok`,
      description:
        brand.detailDescription ??
        `${brand.brandName} 뉴스레터 상세 정보와 아티클을 확인하세요.`,
      openGraph: {
        title: `${brand.brandName} | Newdok`,
        description:
          brand.detailDescription ??
          `${brand.brandName} 뉴스레터 상세 정보`,
        ...(brand.imageUrl ? { images: [brand.imageUrl] } : {}),
      },
    };
  } catch {
    return {
      title: '뉴스레터 | Newdok',
      description: '뉴스레터 상세 정보를 확인하세요.',
    };
  }
}

export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();

  const brand = await newsletterApi
    .fetchGuestNewsletterBrand(Number(id))
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      return undefined;
    });

  return <BrandDetailClient id={Number(id)} initialBrand={brand} />;
}
