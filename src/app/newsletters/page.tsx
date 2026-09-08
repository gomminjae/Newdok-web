import type { Metadata } from 'next';
import { NewsletterExplorer } from '@/widgets/newsletter-explorer/NewsletterExplorer';

export const metadata: Metadata = {
  title: '뉴스레터 모아보기',
  description: '로그인 없이 뉴스레터를 검색하고, 산업과 발행 요일로 필터링해 나에게 맞는 뉴스레터를 찾아보세요.',
  alternates: { canonical: '/newsletters' },
};

export default function NewslettersDirectoryPage() {
  return <NewsletterExplorer />;
}
