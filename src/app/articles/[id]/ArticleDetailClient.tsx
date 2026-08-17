'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleQueries, useToggleBookmark } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { proxyImage } from '@/shared/lib';

export function ArticleDetailClient({ id }: { id: number }) {
  const { isLoggedIn } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: article, isLoading } = useQuery(articleQueries.detail(id));
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
      <main className="flex min-h-dvh items-center justify-center text-base text-caption-neutral">
        아티클을 찾을 수 없습니다.
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
            {article.date}
          </time>
        </header>

        <section
          aria-label="아티클 본문"
          className="article-content min-w-0 break-words px-4 pb-20 pt-5 text-base leading-relaxed text-caption-strong sm:px-6 sm:pt-7"
          dangerouslySetInnerHTML={{ __html: article.articleHTML }}
        />
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
