import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newdok - 뉴스레터 구독 플랫폼',
  description:
    '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요. 관심사에 맞는 뉴스레터를 추천받고 북마크하세요.',
  keywords: ['뉴스레터', '구독', '뉴스레터 추천', '뉴스레터 구독', 'Newdok', '뉴독'],
  openGraph: {
    title: 'Newdok - 뉴스레터 구독 플랫폼',
    description:
      '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Newdok',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newdok - 뉴스레터 구독 플랫폼',
    description:
      '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
  },
};

export default function LandingPage() {
  return (
    <main>
      {/* TODO: 히어로 섹션 */}
      {/* TODO: 기능 소개 섹션 */}
      {/* TODO: 뉴스레터 미리보기 섹션 */}
      {/* TODO: CTA 섹션 */}
      <div>랜딩 페이지</div>
    </main>
  );
}
