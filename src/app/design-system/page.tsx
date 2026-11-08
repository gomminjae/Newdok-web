import type { Metadata } from 'next';
import { DesignSystemPreview } from '@/design-system/DesignSystemPreview';
import { NewsletterListSkeleton, RecommendationsSkeleton } from '@/widgets/newsletter-explorer/NewsletterSkeleton';

export const metadata: Metadata = {
  title: '디자인 시스템',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <><DesignSystemPreview /><section id="explorer-skeletons" className="mx-auto max-w-6xl space-y-4 px-4 pb-20">
    <h2 className="text-xl font-bold">둘러보기 스켈레톤</h2>
    <div className="grid items-start gap-6 md:grid-cols-2">
      <div className="rounded-xl bg-bg-system p-4"><h3 className="mb-4 text-sm font-bold">모든 뉴스레터</h3><NewsletterListSkeleton label="전체 목록 스켈레톤 예시" count={3} /></div>
      <div className="rounded-xl bg-bg-system pb-5"><h3 className="px-6 pt-4 text-sm font-bold">추천 뉴스레터</h3><RecommendationsSkeleton /></div>
    </div>
  </section></>;
}
