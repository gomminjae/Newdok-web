'use client';

import { Button, Chip } from '@/shared/ui';

import Link from 'next/link';
import { memo, useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { newsletterQueries, type NewsletterDetail } from '@/entities/newsletter';
import { userQueries } from '@/entities/user';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

export const NewsletterRecommendations = memo(function NewsletterRecommendations({ active = true }: { active?: boolean }) {
  const intersection = useQuery({ ...newsletterQueries.recommendIntersection(), enabled: active });
  const union = useQuery({ ...newsletterQueries.recommendUnion(), enabled: active });

  if (intersection.isPending || union.isPending) {
    return <p role="status" className="py-16 text-center text-caption-neutral">추천 뉴스레터를 불러오는 중이에요.</p>;
  }
  if (intersection.isError || union.isError) {
    return <div role="alert" className="py-16 text-center">
      <p>추천 뉴스레터를 불러오지 못했어요.</p>
      <Button variant="ghost" size="compact" onClick={() => { void intersection.refetch(); void union.refetch(); }} className="mt-4">다시 시도</Button>
    </div>;
  }
  return <div className="pt-5">
    <RecommendationHeading active={active} />
    {intersection.data.length > 0 && <RecommendationCarousel key={intersection.data.map((item) => item.id).join(",")} items={intersection.data} />}
    <div className="flex items-center justify-between px-6 pt-5 pb-4">
      <h3 className="text-base font-bold">이런 뉴스레터는 어때요?</h3>
      <Button variant="ghost" size="compact" disabled={union.isFetching} onClick={() => void union.refetch()} aria-label={union.isFetching ? '추천 새로고침 중' : '추천 새로고침'}>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={clsx('h-5 w-5', union.isFetching && 'animate-spin motion-reduce:animate-none')}>
          <path d="M16 6a7 7 0 1 0 1 7M16 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>새로고침
      </Button>
    </div>
    <RecommendationList items={union.data} />
    <div className="px-5 pb-20">
      {!union.data.length && !intersection.data.length && <p className="py-8 text-center text-caption-neutral">아직 추천할 뉴스레터가 없어요. 모든 뉴스레터를 둘러보세요.</p>}
    </div>
  </div>;
});

function RecommendationHeading({ active }: { active: boolean }) {
  const { data: nickname } = useQuery({ ...userQueries.profile(), enabled: active, select: (profile) => profile.nickname });
  return <h2 className="px-6 text-xl font-bold">{nickname && <>{nickname}님을 위한<br /></>}맞춤형 뉴스레터가 도착했어요.</h2>;
}

const RecommendationList = memo(function RecommendationList({ items }: { items: NewsletterDetail[] }) {
  return <div className="flex flex-col gap-3 px-5">
    {items.map((newsletter) => <NewsletterDetailRow key={newsletter.id} newsletter={newsletter} />)}
  </div>;
});

const RecommendationCarousel = memo(function RecommendationCarousel({ items }: { items: NewsletterDetail[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const indicatorCount = Math.min(5, items.length);
  const indicatorStart = Math.min(Math.max(0, currentIndex - 2), items.length - indicatorCount);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  function goTo(index: number) {
    const track = trackRef.current;
    const next = (index + items.length) % items.length;
    const card = track?.children[next] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - 24,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  function handleScroll() {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      // Native scrolling handles gestures; React updates only the current page indicator.
      const first = track.children[0] as HTMLElement;
      const second = track.children[1] as HTMLElement | undefined;
      const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
      if (step <= 0) return;
      const next = Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / step)));
      if (indexRef.current !== next) {
        indexRef.current = next;
        setCurrentIndex(next);
      }
    });
  }

  return <section aria-label="맞춤 추천 뉴스레터" aria-roledescription="캐러셀">
    <ul ref={trackRef} onScroll={handleScroll}
      className="landing-scrollbar-none relative flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto overscroll-x-contain px-6 py-5 after:shrink-0 after:basis-[max(0px,calc(100%-356px))] after:content-['']">
      <RecommendationSlides items={items} />
    </ul>
    {items.length > 1 && <div className="flex items-center justify-center gap-1 pb-5">
      <button type="button" aria-label="이전 추천 뉴스레터" onClick={() => goTo(currentIndex - 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-caption-alternative hover:bg-neutral-150">‹</button>
      {Array.from({ length: indicatorCount }, (_, offset) => {
        const index = indicatorStart + offset;
        return <button key={index} type="button" onClick={() => goTo(index)} aria-label={`추천 뉴스레터 ${index + 1}번 보기`} aria-current={index === currentIndex ? 'true' : undefined}
          className="flex h-8 w-6 items-center justify-center">
          <span className={clsx('h-1.5 w-1.5 rounded-full transition-colors duration-300', index === currentIndex ? 'bg-primary' : 'bg-primary-bg-muted')} />
        </button>;
      })}
      <button type="button" aria-label="다음 추천 뉴스레터" onClick={() => goTo(currentIndex + 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-caption-alternative hover:bg-neutral-150">›</button>
    </div>}
  </section>;
});

const RecommendationSlides = memo(function RecommendationSlides({ items }: { items: NewsletterDetail[] }) {
  return items.map((newsletter) => <li key={newsletter.id} className="w-80 max-w-full shrink-0 snap-start">
    <RecommendedCard newsletter={newsletter} />
  </li>);
});

const RecommendedCard = memo(function RecommendedCard({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link
      href={`/newsletters/${newsletter.id}`}
      prefetch={false}
      className="block h-[350px] overflow-hidden rounded-[12px] bg-bg ring-1 ring-inset ring-line-neutral transition-shadow hover:ring-primary"
    >
      <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} variant="recommendation" />
      <div className="border-t border-line-neutral p-4">
        <p className="truncate text-base font-bold text-caption-heavy mb-2">
          {newsletter.brandName}
        </p>
        <p className="text-sm font-medium text-caption-neutral line-clamp-2 h-10 mb-3">
          {newsletter.firstDescription}
        </p>
        <div className="landing-scrollbar-none flex min-h-[30px] gap-1.5 overflow-x-auto">
          {newsletter.interests.slice(0, 3).map((interest) => (
            <Chip key={interest.id}>{interest.name}</Chip>
          ))}
        </div>
      </div>
    </Link>
  );
});

const NewsletterDetailRow = memo(function NewsletterDetailRow({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link
      href={`/newsletters/${newsletter.id}`}
      prefetch={false}
      className="block bg-bg rounded-[8px] border border-line-neutral px-5 pt-4 transition-colors hover:bg-neutral-50"
    >
      <div className="flex items-start gap-2 pb-[18px]">
        <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} variant="thumbnail" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-caption-heavy pt-0.5 mb-3">
            {newsletter.brandName}
          </p>
          <p className="text-sm font-medium text-caption-neutral line-clamp-2">
            {newsletter.firstDescription}
          </p>
        </div>
      </div>
      {newsletter.interests.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 pb-5">
          {newsletter.interests.slice(0, 3).map((interest) => (
            <Chip key={interest.id}>{interest.name}</Chip>
          ))}
        </div>
      )}
    </Link>
  );
});
