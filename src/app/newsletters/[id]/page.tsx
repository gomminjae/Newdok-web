import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getPublicNewsletters, getPublicNewsletterBrand } from '@/entities/newsletter/api/public-newsletter.server';
import { ApiError } from '@/shared/api/client';
import { BrandDetailClient } from './BrandDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

// 빌드 시 요청을 제한하고, 나머지 유효한 브랜드는 첫 방문 때 생성해 캐시한다.
export async function generateStaticParams() {
  const brands = await getPublicNewsletters();
  return brands.slice(0, 12).map((brand) => ({ id: String(brand.brandId) }));
}

// 메타데이터와 본문이 같은 검증 결과와 조회 Promise를 공유한다.
const getBrand = cache(async (id: string) => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  try {
    return await getPublicNewsletterBrand(Number(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const brand = await getBrand(id);
  const title = `${brand.brandName} 뉴스레터`;
  const description = brand.detailDescription?.trim() || `${brand.brandName} 뉴스레터 소개와 발행 일정, 지난 아티클을 확인하세요.`;
  const images = [brand.imageUrl || '/og.png'];

  return {
    title,
    description,
    alternates: { canonical: `/newsletters/${id}` },
    openGraph: {
      title: `${title} | Newdok`, description, images,
      url: `/newsletters/${id}`, type: 'website', locale: 'ko_KR', siteName: 'Newdok',
    },
    twitter: { card: 'summary_large_image', title: `${title} | Newdok`, description, images },
  };
}

export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params;
  const brand = await getBrand(id);

  return <BrandDetailClient key={id} id={Number(id)} initialBrand={brand} />;
}
