import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newdok - 뉴스레터 구독 플랫폼',
  description:
    '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
  openGraph: {
    title: 'Newdok - 뉴스레터 구독 플랫폼',
    description:
      '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
  },
};

export default function HomePage() {
  return <div>홈</div>;
}
