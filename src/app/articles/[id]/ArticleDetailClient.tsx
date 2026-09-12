'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleQueries, useToggleBookmark } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { Button, ButtonLink } from '@/shared/ui';
import { NewsletterContent } from '@/shared/ui/NewsletterContent';
import { ApiError } from '@/shared/api/client';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

export function ArticleDetailClient({ id }: { id: number }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: article, isLoading, error, refetch } = useQuery(articleQueries.detail(id, isLoggedIn));
  const toggleBookmark = useToggleBookmark(id);

  const handleBookmarkToggle = () => {
    if (!article || !isLoggedIn) return;
    toggleBookmark.mutate();
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-base text-primary">
        로딩 중...
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center text-base text-caption-neutral">
        <h1 className="font-bold text-caption-heavy">{error instanceof ApiError && error.status === 404 ? '아티클을 찾을 수 없어요.' : '아티클을 불러오지 못했어요.'}</h1>
        <Button variant="ghost" size="compact" onClick={() => void refetch()} className="mt-5">다시 시도</Button>
        <ButtonLink href="/search" variant="neutral-outline" size="compact" className="mt-3">뉴스레터 둘러보기</ButtonLink>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-10 bg-bg">
        <div className="mx-auto flex h-11 w-full max-w-3xl items-center px-5">
          <button type="button" aria-label="뒤로 가기" onClick={() => window.history.length > 1 ? router.back() : router.replace(`/newsletters/${article.brandId}`)} className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center text-caption-heavy">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="m17 6-8 8 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <Link
            href={`/newsletters/${article.brandId}`}
            className="flex min-w-0 flex-1 items-center"
          >
            <span className="truncate text-base font-bold text-caption-heavy">
              {article.brandName}
            </span>
          </Link>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={article.isBookmarked ? '북마크 해제' : '북마크 추가'}
              aria-pressed={article.isBookmarked}
              disabled={toggleBookmark.isPending}
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center bg-transparent disabled:opacity-50"
            >
              <img
                src={
                  article.isBookmarked
                    ? '/images/Fill Bookmark.svg'
                    : '/images/Line Bookmark.svg'
                }
                alt=""
                width={28}
                height={28}
              />
            </button>
          )}
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl">
        <header className="relative h-[260px] overflow-hidden bg-neutral-150 [&>span]:h-full [&>span]:aspect-auto">
          <NewsletterImage name={article.brandName} imageUrl={article.brandImageUrl || null} cover />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-linear-to-b from-transparent to-black/40" />
          <div className="absolute right-[42px] bottom-4 left-5">
            <h1 className="line-clamp-2 text-[22px] font-bold leading-[1.3] text-white">{article.articleTitle}</h1>
            <time dateTime={article.date} className="mt-1 block text-sm text-neutral-300">{formatArticleDate(article.date)}</time>
          </div>
        </header>

        <section aria-label="아티클 본문" className="min-w-0 px-1.5 pb-10">
          <NewsletterContent html={article.articleHTML} title={article.articleTitle} />
        </section>
        <div className="border-t border-line-neutral px-5 py-8 text-center">
          <ButtonLink href={`/newsletters/${article.brandId}`} variant="outline">{article.brandName}의 다른 아티클 보기 →</ButtonLink>
        </div>
      </article>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="아티클 맨 위로 이동"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-bg shadow-[0_4px_8px_#00000026] transition-colors hover:bg-neutral-50"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V2m-5 5 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
    </main>
  );
}

function formatArticleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Seoul' }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('month')}월 ${part('day')}일 (${part('weekday')}) ${part('dayPeriod')} ${part('hour')}:${part('minute')}`;
}
