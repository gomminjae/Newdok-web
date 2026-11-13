'use client';

import Link from 'next/link';
import { memo, Suspense, useCallback, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { newsletterQueries, type NewsletterSearchResult } from '@/entities/newsletter';
import { LoadingState, StatusMessage, Button, ButtonLink, Input, Icon } from '@/shared/ui';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

// The same registration request form used by the app's FeedbackView.
const REGISTRATION_REQUEST_URL = 'https://7xrdp4cp24a.typeform.com/to/Lkh7C9zd';

export function NewsletterSearch() {
  return <Suspense fallback={<SearchLoading />}><SearchContent /></Suspense>;
}

function SearchLoading() {
  return <LoadingState label="검색 정보를 불러오는 중이에요." />;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = (searchParams?.get('q') ?? '').trim().slice(0, 100);
  const queryClient = useQueryClient();

  const search = useCallback((value: string) => {
    const next = value.trim().slice(0, 100);
    if (next === keyword) {
      if (next) void queryClient.refetchQueries({
        queryKey: newsletterQueries.search(next).queryKey,
        exact: true,
        type: 'active',
      });
      return;
    }
    const params = new URLSearchParams();
    if (next) params.set('q', next);
    window.history.replaceState(null, '', `/search${next ? `?${params}` : ''}`);
  }, [keyword, queryClient]);

  return <section aria-label="뉴스레터 검색" className="-mx-4 min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] bg-bg-system md:-mx-6 xl:-mx-10">
    <SearchForm keyword={keyword} onSearch={search} />
    {!keyword ? <PopularSearches onSearch={search} /> : <SearchResults key={`results:${keyword}`} keyword={keyword} />}
  </section>;
}

function PopularSearches({ onSearch }: { onSearch: (value: string) => void }) {
  const popular = useQuery(newsletterQueries.popularSearchKeywords());

  return <section aria-labelledby="popular-search-heading" className="page-enter px-5 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 id="popular-search-heading" className="text-base font-medium">인기검색어</h2>
        {popular.data?.updatedDate && <p className="text-xs font-medium text-primary">{popular.data.updatedDate} 업데이트</p>}
      </div>
      {popular.isPending ? <SearchLoading /> : popular.isError ? <SearchError onRetry={() => void popular.refetch()} />
        : popular.data.keywords.length ? <ol>
          {popular.data.keywords.map(({ rank, keyword: value }) => <li key={rank}>
            <button type="button" onClick={() => onSearch(value)} aria-label={`${rank}위, ${value}`} className="flex min-h-11 w-full items-center gap-4 text-left text-sm transition-colors hover:bg-bg-system">
              <span className="min-w-3 font-bold text-primary">{rank}</span>
              <span className="font-medium text-caption-neutral">{value}</span>
            </button>
          </li>)}
        </ol> : <p className="text-sm text-caption-neutral">표시할 인기 검색어가 없습니다.</p>}
    </section>;
}

function SearchResults({ keyword }: { keyword: string }) {
  const results = useQuery(newsletterQueries.search(keyword));

  return <section aria-label="검색 결과" aria-busy={results.isFetching} className={`page-enter min-h-[calc(100dvh-160px)] bg-bg-system px-5 pb-12 ${results.data?.length ? 'pt-[25px]' : 'pt-2.5'}`}>
      {results.isPending ? <SearchLoading /> : results.isError ? <SearchError onRetry={() => void results.refetch()} />
        : results.data.length ? <>
          <h2 className="mb-3 text-base font-medium">뉴스레터</h2>
          <StatusMessage className="mb-4">{keyword} 검색 결과 {results.data.length}개</StatusMessage>
          <SearchResultList results={results.data} />
        </> : <div role="status" className="flex flex-col items-center gap-4 pt-2 text-center">
          <h2 className="text-base font-bold">검색 결과가 없어요.</h2>
          <p className="text-sm font-medium text-caption-neutral">찾는 뉴스레터가 없다면 등록을 요청해보세요.</p>
          <div className="w-full px-1"><ButtonLink href={REGISTRATION_REQUEST_URL} target="_blank" rel="noopener noreferrer" variant="outline" fullWidth>뉴스레터 등록 요청하기<span className="sr-only"> (새 창)</span></ButtonLink></div>
        </div>}
    </section>;
}

const SearchResultList = memo(function SearchResultList({ results }: { results: NewsletterSearchResult[] }) {
  return <ul className="space-y-3">
    {results.map((result) => <li key={result.id}>
      <Link href={`/newsletters/${result.id}`} prefetch={false} className="flex items-center gap-3 rounded-[12px] bg-bg p-4 transition-colors hover:bg-neutral-50">
        <NewsletterImage name={result.brandName} imageUrl={result.imageUrl ?? null} variant="thumbnail" />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-caption-title">{result.brandName}</h3>
          <p className="mt-1 text-sm font-medium break-words text-caption-strong">{result.firstDescription}</p>
        </div>
      </Link>
    </li>)}
  </ul>;
});

const SearchForm = memo(function SearchForm({ keyword, onSearch }: { keyword: string; onSearch: (value: string) => void }) {
  const router = useRouter();
  const [value, setValue] = useState(keyword);
  const [previousKeyword, setPreviousKeyword] = useState(keyword);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync URL-driven searches without replacing the input and losing focus.
  if (previousKeyword !== keyword) {
    setPreviousKeyword(keyword);
    setValue(keyword);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    inputRef.current?.blur();
    onSearch(value);
  }

  return <form role="search" onSubmit={submit} className="sticky top-[var(--header-height)] z-30 flex min-h-14 items-center gap-2 border-b border-line-neutral bg-bg px-4 py-2">
    <Button type="submit" variant="ghost-neutral" size="icon" aria-label="검색"><Icon name="Line Search" /></Button>
    <label htmlFor="newsletter-search-input" className="sr-only">뉴스레터 검색어</label>
    <Input variant="search" ref={inputRef} id="newsletter-search-input" type="text" inputMode="search" enterKeyHint="search" autoFocus={!keyword} autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={100} value={value}
      onChange={(event) => { setValue(event.target.value); if (!event.target.value) onSearch(''); }} placeholder="검색어를 입력하세요."
      onKeyDown={(event) => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault(); }}
      className="min-w-0 flex-1" />
    <Button variant="ghost-neutral" size="icon" aria-label={value ? '검색어 지우기' : '검색 닫기'} onClick={() => { if (value) { setValue(''); onSearch(''); inputRef.current?.focus(); } else if (window.history.length > 1) router.back(); else router.replace('/explore'); }}><Icon name="Line Close" /></Button>
  </form>;
});

function SearchError({ onRetry }: { onRetry: () => void }) {
  return <div role="alert" className="py-12 text-center text-sm text-caption-neutral">
    <p>검색 정보를 불러오지 못했어요.</p>
    <Button variant="ghost" size="compact" onClick={onRetry} className="mt-3">다시 시도하기</Button>
  </div>;
}
