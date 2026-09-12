import type { Metadata } from 'next';
import { NewsletterExplorer } from '@/widgets/newsletter-explorer/NewsletterExplorer';
import { getPublicNewsletters } from '@/entities/newsletter/api/public-newsletter.server';

export const metadata: Metadata = {
  title: '뉴스레터 모아보기',
  description: '로그인 없이 뉴스레터를 검색하고, 산업과 발행 요일로 필터링해 나에게 맞는 뉴스레터를 찾아보세요.',
  alternates: { canonical: '/newsletters' },
  openGraph: {
    title: '뉴스레터 모아보기 | Newdok',
    description: '산업과 발행 요일로 필터링해 나에게 맞는 뉴스레터를 찾아보세요.',
    url: '/newsletters',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Newdok',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '뉴스레터 모아보기 | Newdok',
    description: '산업과 발행 요일로 필터링해 나에게 맞는 뉴스레터를 찾아보세요.',
    images: ['/og.png'],
  },
};

export default async function NewslettersDirectoryPage() {
  const brands = await getPublicNewsletters();
  return <NewsletterExplorer initialBrands={brands} />;
}
