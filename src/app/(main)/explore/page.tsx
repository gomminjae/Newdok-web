import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '뉴스레터 탐색 | Newdok',
  description:
    '관심 분야별 뉴스레터를 탐색하고 구독하세요. 업계, 요일, 인기순으로 필터링할 수 있습니다.',
  openGraph: {
    title: '뉴스레터 탐색 | Newdok',
    description:
      '관심 분야별 뉴스레터를 탐색하고 구독하세요.',
  },
};

export default function ExplorePage() {
  return <div>탐색</div>;
}
