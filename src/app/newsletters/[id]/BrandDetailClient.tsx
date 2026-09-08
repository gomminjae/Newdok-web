'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsletterQueries, type BrandDetail } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

export function BrandDetailClient({ id, initialBrand }: { id: number; initialBrand?: BrandDetail }) {
  const { isLoggedIn } = useAuth();
  const [visibleCount, setVisibleCount] = useState(12);
  const { data: brand, isPending, isError, refetch } = useQuery({
    ...newsletterQueries.brand(id, isLoggedIn),
    initialData: isLoggedIn ? undefined : initialBrand,
    initialDataUpdatedAt: 0,
  });

  if (isPending) {
    return <p role="status" className="py-24 text-center text-primary">뉴스레터를 불러오는 중이에요.</p>;
  }
  if (!brand || isError) {
    return (
      <div role="alert" className="py-24 text-center">
        <h1 className="text-xl font-bold">뉴스레터를 불러오지 못했어요.</h1>
        <button type="button" onClick={() => void refetch()} className="mt-5 min-h-11 px-5 font-bold text-primary">다시 시도</button>
        <Link href="/search" className="mt-3 block text-sm text-caption-neutral underline">뉴스레터 둘러보기</Link>
      </div>
    );
  }

  const subscribeUrl = /^https?:\/\//i.test(brand.subscribeUrl) ? brand.subscribeUrl : null;
  return (
    <div className="py-5 sm:py-8">
      <Link href="/search" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-caption-neutral">← 모든 뉴스레터</Link>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-line-disabled">
            <NewsletterImage name={brand.brandName} imageUrl={brand.imageUrl} cover />
          </div>
          <h1 className="mt-6 break-words text-2xl font-bold sm:text-3xl">{brand.brandName}</h1>
          <p className="mt-3 text-sm leading-6 text-caption-neutral">{brand.publicationCycle || '발행 일정은 발행처에서 확인해주세요.'}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {brand.interests.map((interest) => <li key={interest.id} className="rounded-full bg-tint-50 px-3 py-1.5 text-xs text-primary">#{interest.name}</li>)}
          </ul>
          {brand.detailDescription && <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-caption-neutral">{brand.detailDescription}</p>}
          {subscribeUrl && (
            <a href={subscribeUrl} target="_blank" rel="noopener noreferrer"
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-strong">
              {isLoggedIn && brand.subscribeCheck ? '발행처 방문하기 ↗' : '발행처에서 구독하기 ↗'}
            </a>
          )}
          <p className="mt-3 text-xs leading-5 text-caption-alternative">
            {subscribeUrl ? '새 창에서 발행처 페이지가 열려요. 이메일로 직접 구독할 수 있어요.' : '현재 구독 링크가 준비되지 않았어요. 지난 아티클을 먼저 읽어보세요.'}
          </p>
        </section>

        <section aria-labelledby="brand-articles" className="min-w-0">
          <div className="mb-4 flex items-center justify-between border-b border-line-disabled pb-4">
            <h2 id="brand-articles" className="text-lg font-bold">지난 아티클</h2>
            <span className="text-sm text-caption-neutral">{brand.brandArticleList.length}개</span>
          </div>
          {brand.brandArticleList.length ? (
            <ul className="space-y-3">
              {brand.brandArticleList.slice(0, visibleCount).map((article) => (
                <li key={article.id}>
                  <Link href={`/articles/${article.id}`} className="flex min-w-0 items-center gap-4 rounded-xl border border-line-disabled p-4 hover:border-primary hover:bg-tint-50/30 sm:p-5">
                    <span className="min-w-0 flex-1">
                      <strong className="line-clamp-2 break-words text-sm leading-6 sm:text-base">{article.title}</strong>
                      <time dateTime={article.date} className="mt-2 block text-xs text-caption-alternative">{formatPublicationDate(article.date)}</time>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-xl text-caption-assistive">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-xl bg-bg-system px-5 py-12 text-center text-sm text-caption-neutral">아직 공개된 아티클이 없어요.</p>}
          {visibleCount < brand.brandArticleList.length && (
            <button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="mt-5 min-h-12 w-full rounded-xl border border-line-alternative text-sm font-bold hover:bg-bg-system">아티클 더 보기</button>
          )}
        </section>
      </div>
    </div>
  );
}

function formatPublicationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
  }).format(date);
}
