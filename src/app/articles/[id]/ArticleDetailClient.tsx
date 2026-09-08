'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleQueries, useToggleBookmark } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { proxyImage } from '@/shared/lib';
import { NewsletterContent } from '@/shared/ui/NewsletterContent';
import { ApiError } from '@/shared/api/client';

export function ArticleDetailClient({ id }: { id: number }) {
  const { isLoggedIn } = useAuth();
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button type="button" onClick={() => void refetch()} className="mt-5 min-h-11 px-5 text-primary">다시 시도</button>
        <Link href="/search" className="mt-3 text-sm underline">뉴스레터 둘러보기</Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-10 border-b border-neutral-150 bg-bg">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4 sm:px-6">
          <Link
            href={`/newsletters/${article.brandId}`}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            {article.brandImageUrl && (
              <img
                src={proxyImage(article.brandImageUrl)}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-md border border-neutral-150 object-cover"
              />
            )}
            <span className="truncate text-base font-bold text-caption-heavy">
              {article.brandName}
            </span>
          </Link>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={article.isBookmarked ? '북마크 해제' : '북마크 추가'}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-transparent"
            >
              <img
                src={
                  article.isBookmarked
                    ? '/images/Fill Bookmark.svg'
                    : '/images/Line Bookmark.svg'
                }
                alt=""
                width={24}
                height={24}
              />
            </button>
          )}
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl">
        <header className="border-b border-neutral-150 px-4 pb-4 pt-5 sm:px-6 sm:pt-7">
          <h1 className="mb-2 text-xl font-bold leading-snug text-caption-heavy sm:text-2xl">
            {article.articleTitle}
          </h1>
          <time
            dateTime={article.date}
            className="text-[13px] font-medium text-caption-assistive"
          >
            {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date(article.date))}
          </time>
        </header>

        <section aria-label="아티클 본문" className="min-w-0 px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
          <NewsletterContent html={article.articleHTML} title={article.articleTitle} />
        </section>
        <div className="border-t border-line-disabled px-5 py-8 text-center">
          <Link href={`/newsletters/${article.brandId}`} className="inline-flex min-h-12 items-center rounded-xl bg-tint-50 px-6 text-sm font-bold text-primary">{article.brandName}의 다른 아티클 보기 →</Link>
        </div>
      </article>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="아티클 맨 위로 이동"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-150 bg-bg shadow-md transition-colors hover:bg-neutral-50 sm:right-6"
        >
          <img src="/images/Line Up.svg" alt="" width={24} height={24} />
        </button>
      )}
    </main>
  );
}
