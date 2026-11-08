import type { ReactNode } from 'react';
import { Chip, MediaFrame, Skeleton } from '@/shared/ui';

function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="pointer-events-none motion-safe:animate-pulse">{children}</div>
  </div>;
}

function InterestsPlaceholder() {
  return <div className="flex flex-wrap gap-1.5">
    {[12, 16, 14].map((width) => <Chip key={width}><Skeleton className={width === 12 ? 'h-4 w-12' : width === 16 ? 'h-4 w-16' : 'h-4 w-14'} /></Chip>)}
  </div>;
}

function ListPlaceholder({ count, variant }: { count: number; variant: 'brand' | 'recommendation' }) {
  return <ul className="flex flex-col gap-3">
    {Array.from({ length: count }, (_, index) => <li key={index} className="nd-card-link p-4">
      <div className="flex items-start gap-2">
        <MediaFrame variant="thumbnail"><Skeleton className="h-full w-full" /></MediaFrame>
        <div className="min-w-0 flex-1 xl:flex xl:items-center xl:justify-between xl:gap-5">
          <div className="min-w-0 flex-1"><Skeleton className="h-6 w-2/5" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-1 h-4 w-3/4" /></div>
          {variant === 'brand' && <div className="mt-3 xl:mt-0 xl:max-w-80"><InterestsPlaceholder /></div>}
        </div>
      </div>
      {variant === 'recommendation' && <div className="mt-4"><InterestsPlaceholder /></div>}
    </li>)}
  </ul>;
}

function RecommendationCardPlaceholder() {
  return <><div className="py-5">
    <div className="nd-card-link mx-6 h-[350px] w-[calc(100%-48px)] max-w-[320px] overflow-hidden">
      <MediaFrame variant="recommendation"><Skeleton className="h-full w-full" /></MediaFrame>
      <div className="p-4"><Skeleton className="h-6 w-2/5" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-1 h-4 w-3/4" /><div className="mt-3"><InterestsPlaceholder /></div></div>
    </div>
  </div><div className="flex h-14 items-start justify-center gap-3 pt-3">{[0, 1, 2, 3, 4].map((index) => <Skeleton key={index} className="h-1.5 w-1.5" />)}</div></>;
}

export function NewsletterListSkeleton({ label = '뉴스레터를 불러오는 중이에요.', count = 4, variant = 'brand' }: {
  label?: string;
  count?: number;
  variant?: 'brand' | 'recommendation';
}) {
  return <LoadingRegion label={label}><ListPlaceholder count={count} variant={variant} /></LoadingRegion>;
}

export function RecommendationCardSkeleton() {
  return <LoadingRegion label="맞춤 추천을 불러오는 중이에요."><RecommendationCardPlaceholder /></LoadingRegion>;
}

export function RecommendationsSkeleton() {
  return <LoadingRegion label="맞춤 뉴스레터를 불러오는 중이에요.">
    <div className="pt-5">
      <div className="px-6"><Skeleton className="h-6 w-1/2" /><Skeleton className="mt-2 h-6 w-3/4" /></div>
      <RecommendationCardPlaceholder />
      <div className="px-6 pt-5 pb-4"><Skeleton className="h-6 w-3/5" /></div>
      <div className="px-5 pb-20"><ListPlaceholder count={3} variant="recommendation" /></div>
    </div>
  </LoadingRegion>;
}
