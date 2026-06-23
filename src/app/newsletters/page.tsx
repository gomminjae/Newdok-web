import type { Metadata } from 'next';
import Link from 'next/link';
import { newsletterApi } from '@/entities/newsletter';

// ISR: 10분마다 백그라운드 재검증
export const revalidate = 600;

export const metadata: Metadata = {
  title: '뉴스레터 모아보기 | Newdok',
  description:
    '관심사에 맞는 뉴스레터를 한 곳에서 발견하세요. 업계/요일/인기순으로 필터링해 원하는 뉴스레터를 찾을 수 있습니다.',
  keywords: ['뉴스레터', '뉴스레터 추천', '뉴스레터 모음', '뉴스레터 구독'],
  openGraph: {
    title: '뉴스레터 모아보기 | Newdok',
    description:
      '관심사에 맞는 뉴스레터를 한 곳에서 발견하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Newdok',
  },
};

type SearchParams = Promise<{
  orderOpt?: string;
  industry?: string;
  day?: string;
}>;

export default async function NewslettersDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const brands = await newsletterApi
    .fetchGuestAllNewsletterBrands(params)
    .catch(() => []);

  return (
    <main>
      <h1>뉴스레터 모아보기</h1>
      <p>관심사에 맞는 뉴스레터를 찾아보세요.</p>
      {/* TODO: 필터(업계/요일/정렬) UI를 'use client' 섬으로 추가 */}
      <ul>
        {brands.map((brand) => (
          <li key={brand.brandId}>
            <Link href={`/newsletters/${brand.brandId}`}>
              {brand.brandName}
            </Link>
            {brand.shortDescription && <p>{brand.shortDescription}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
