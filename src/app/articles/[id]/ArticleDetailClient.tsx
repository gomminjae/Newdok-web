'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleQueries, useToggleBookmark } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { proxyImage } from '@/shared/lib';

export function ArticleDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
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
      <div className="flex items-center justify-center min-h-screen text-primary text-base">
        로딩 중...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen text-caption-neutral text-base">
        아티클을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="sticky top-0 z-10 flex items-center h-14 px-2 bg-bg border-b border-neutral-150">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-transparent flex-shrink-0"
        >
          <img src="/images/Line left.svg" alt="뒤로" width={24} height={24} />
        </button>
        <Link
          href={`/newsletters/${article.brandId}`}
          className="flex-1 flex items-center justify-center gap-2 min-w-0"
        >
          {article.brandImageUrl && (
            <img
              src={proxyImage(article.brandImageUrl)}
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-cover border border-neutral-150"
            />
          )}
          <span className="text-base font-bold text-caption-heavy truncate">
            {article.brandName}
          </span>
        </Link>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className="w-10 h-10 flex items-center justify-center bg-transparent flex-shrink-0"
          >
            <img
              src={
                article.isBookmarked
                  ? '/images/Fill Bookmark.svg'
                  : '/images/Line Bookmark.svg'
              }
              alt="북마크"
              width={24}
              height={24}
            />
          </button>
        ) : (
          <div className="w-10 h-10 flex-shrink-0" />
        )}
      </div>

      <div className="px-6 pt-5 pb-4 border-b border-neutral-150">
        <h1 className="text-xl font-bold text-caption-heavy leading-snug mb-2">
          {article.articleTitle}
        </h1>
        <span className="text-[13px] font-medium text-caption-assistive">
          {article.date}
        </span>
      </div>

      <div
        ref={contentRef}
        className="article-content px-6 pt-5 pb-20 text-base leading-relaxed text-caption-strong break-words overflow-x-hidden"
        dangerouslySetInnerHTML={{ __html: article.articleHTML }}
      />

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-[90px] right-5 w-11 h-11 bg-bg border border-neutral-150 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-neutral-50 transition-colors"
        >
          <img src="/images/Line Up.svg" alt="맨 위로" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
