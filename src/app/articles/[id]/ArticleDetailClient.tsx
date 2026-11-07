'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleQueries, useToggleBookmark } from '@/entities/article';
import { useAuth, useToast } from '@/shared/hooks';
import { AppImage, Button, ButtonLink, Icon, Toast } from '@/shared/ui';
import { ArticleReader } from '@/features/reader/ArticleReader';
import { userQueries } from '@/entities/user';
import { ApiError, getErrorMessage } from '@/shared/api/client';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

export function ArticleDetailClient({ id, archive = false }: { id: number; archive?: boolean }) {
  const { isLoggedIn } = useAuth();
  const { message, showToast } = useToast();
  const [bookmarkError, setBookmarkError] = useState('');
  const profile = useQuery({ ...userQueries.profile(), enabled: isLoggedIn && !archive });
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: article, isLoading, error, refetch } = useQuery(articleQueries.detail(id, isLoggedIn));
  const toggleBookmark = useToggleBookmark(id);

  const handleBookmarkToggle = async () => {
    if (!article || !isLoggedIn || archive || toggleBookmark.isPending) return;
    setBookmarkError('');
    try { await toggleBookmark.mutateAsync(); showToast(article.isBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.'); }
    catch (error) { setBookmarkError(getErrorMessage(error, '북마크를 변경하지 못했어요. 다시 시도해주세요.')); }
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
      <article className="mx-auto w-full max-w-3xl">
        <ArticleReader key={`${id}-${profile.data?.id ?? 'guest'}-${archive}`} html={article.articleHTML} title={article.articleTitle} articleId={id} userId={isLoggedIn ? profile.data?.id : undefined} archive={archive} renderHeader={(controls) => <header className="sticky top-0 z-10 bg-bg">
        <div className="flex h-11 w-full items-center gap-2 px-5">
          <Button variant="ghost-neutral" size="icon" aria-label="뒤로 가기" onClick={() => window.history.length > 1 ? router.back() : router.replace(`/newsletters/${article.brandId}`)}><Icon name="Back" size={28} /></Button>
          <Link
            href={`/newsletters/${article.brandId}`}
            className="flex min-w-0 flex-1 items-center"
          >
            <span className="truncate text-base font-bold text-caption-heavy">
              {article.brandName}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">{controls}{isLoggedIn && !archive && (
            <Button variant="ghost-neutral" size="icon" onClick={() => void handleBookmarkToggle()} aria-label={article.isBookmarked ? '북마크 해제' : '북마크 추가'} aria-pressed={article.isBookmarked} disabled={toggleBookmark.isPending}>
              {article.isBookmarked ? <AppImage name="bookmarked" alt="" width={28} height={28} /> : <Icon name="Line Bookmark" size={28} />}
            </Button>
          )}</div>
        </div>
      </header>}>
        <header className="relative h-[260px] overflow-hidden bg-neutral-150 [&>span]:h-full [&>span]:aspect-auto">
          <NewsletterImage name={article.brandName} imageUrl={article.brandImageUrl || null} cover />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-linear-to-b from-transparent to-black/40" />
          <div className="absolute right-4 bottom-4 left-4">
            <h1 className="line-clamp-2 text-base font-bold leading-[22px] text-white">{article.articleTitle}</h1>
            <time dateTime={article.date} className="mt-1 block text-sm text-neutral-300">{formatArticleDate(article.date)}</time>
          </div>
        </header>

        {bookmarkError && <p role="alert" className="px-4 py-3 text-sm text-error">{bookmarkError}</p>}
        </ArticleReader>
        <div className="border-t border-line-neutral px-5 py-8 text-center">
          <ButtonLink href={`/newsletters/${article.brandId}`} variant="outline">{article.brandName}의 다른 아티클 보기 →</ButtonLink>
        </div>
      </article>

      {message && <Toast message={message} />}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="아티클 맨 위로 이동"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-bg shadow-scroll-top transition-colors hover:bg-neutral-50"
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
