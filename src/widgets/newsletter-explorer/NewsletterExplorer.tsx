'use client';

import Link from 'next/link';
import { memo, Suspense, useState, type ReactNode } from 'react';
import { redirect, usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { newsletterApi, newsletterQueries, type NewsletterBrand } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { Button, Chip, GuestNotice, SubscriptionBadge } from '@/shared/ui';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';
import { ExplorerDialog, NewsletterFilters } from './NewsletterFilters';
import { NewsletterRecommendations } from './NewsletterRecommendations';

export function NewsletterExplorer() {
  return <Suspense fallback={<ExplorerLoading />}><ExplorerRoute /></Suspense>;
}

function ExplorerRoute() {
  const params = useSearchParams();
  if (params?.get('search') === '1' || params?.get('q')) {
    const query = new URLSearchParams();
    const keyword = (params.get('q') ?? '').slice(0, 100);
    if (keyword) query.set('q', keyword);
    redirect(`/search/newsletters${keyword ? `?${query}` : ''}`);
  }
  return <ExplorerContent />;
}

function ExplorerLoading() {
  return <p role="status" className="py-16 text-center text-caption-neutral">뉴스레터를 불러오는 중이에요.</p>;
}

function readIds(params: URLSearchParams, key: string) {
  return [...new Set(params.getAll(key).filter((id) => /^[1-9]\d*$/.test(id)))].sort((a, b) => Number(a) - Number(b));
}

function ExplorerContent() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname() ?? '/search';
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const tabs = isLoggedIn
    ? (['recommend', 'all'] as const)
    : (['all', 'recommend'] as const);
  const requestedTab = searchParams.get('tab');
  const hasSearch = ['industry', 'day', 'orderOpt'].some((key) => searchParams.has(key));
  const tab = requestedTab === 'recommend' || requestedTab === 'all'
    ? requestedTab : hasSearch ? 'all' : tabs[0];
  const orderOpt = searchParams.get('orderOpt') === '최신순' ? '최신순' : '인기순';
  const industries = readIds(searchParams, 'industry');
  const days = readIds(searchParams, 'day');
  const [dialog, setDialog] = useState<'sort' | 'filters' | null>(null);
  const options = useQuery({ queryKey: ['newsletter', 'options'], queryFn: newsletterApi.fetchOptionList, staleTime: 3_600_000, enabled: dialog === 'filters' });
  const brands = useQuery({
    ...newsletterQueries.list({ orderOpt, industry: industries, day: days }, isLoggedIn),
    enabled: tab === 'all',
  });

  function updateParams(values: Record<string, string | string[]>) {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    for (const [key, value] of Object.entries(values)) {
      params.delete(key);
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item) params.append(key, item);
      }
    }
    window.history.replaceState(null, '', `${pathname}?${params}${window.location.hash}`);
  }

  function resetFilters() {
    updateParams({ industry: [], day: [], orderOpt: '' });
  }

  return (
    <section aria-label="뉴스레터 둘러보기" className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg-system sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
      <div role="tablist" aria-label="뉴스레터 목록" className="relative flex border-b border-line-neutral bg-bg pt-4">
        {tabs.map((value) => (
          <button key={value} id={`newsletter-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls={`newsletter-panel-${value}`}
            tabIndex={tab === value ? 0 : -1}
            onKeyDown={(event) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tab === 'all' ? 'recommend' : 'all';
                updateParams({ tab: next });
                document.getElementById(`newsletter-tab-${next}`)?.focus();
              }
            }}
            onClick={() => updateParams({ tab: value })}
            className={clsx('min-h-11 flex-1 px-2 py-3 text-sm font-bold transition-colors duration-300 ease-in-out', tab === value ? 'text-caption-strong' : 'text-caption-alternative')}>
            {value === 'recommend' ? '추천 뉴스레터' : '모든 뉴스레터'}
          </button>
        ))}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-1/2 bg-caption-strong transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${tab === tabs[0] ? 0 : 100}%)` }} />
      </div>

        <div hidden={tab !== 'recommend'} role="tabpanel" id="newsletter-panel-recommend" aria-labelledby="newsletter-tab-recommend" className={tab === 'recommend' ? 'page-enter' : undefined}>
          {isLoggedIn ? <NewsletterRecommendations active={tab === 'recommend'} /> : <GuestNotice />}
        </div>
        <div hidden={tab !== 'all'} role="tabpanel" id="newsletter-panel-all" aria-labelledby="newsletter-tab-all" className={clsx('flex-1 pb-20', tab === 'all' && 'page-enter')}>
          <div className="flex items-center gap-3 bg-bg px-5 pt-5 pb-4 sm:px-6 min-[1024px]:px-8">
            <div className="landing-scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            <FilterButton onClick={() => setDialog('sort')} active={false} label={`${orderOpt === '최신순' ? '최신등록순' : '인기순'} 정렬`}>
              {orderOpt === '최신순' ? '최신등록순' : '인기순'} <span aria-hidden="true" className="text-xs">⇅</span>
            </FilterButton>
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line-neutral" />
            <FilterButton onClick={() => setDialog('filters')} active={industries.length > 0} label={`산업 필터${industries.length ? ` ${industries.length}개 선택` : ''}`}>
              산업{industries.length > 0 && ` ${industries.length}`} <Chevron />
            </FilterButton>
            <FilterButton onClick={() => setDialog('filters')} active={days.length > 0} label={`발행 요일 필터${days.length ? ` ${days.length}개 선택` : ''}`}>
              발행 요일{days.length > 0 && ` ${days.length}`} <Chevron />
            </FilterButton>
            </div>
            <button type="button" onClick={resetFilters} aria-label="필터 초기화" className="flex h-11 w-11 shrink-0 items-center justify-center text-primary">
              <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="px-5 pt-3 sm:px-6 min-[1024px]:px-8">
          {brands.isPending ? <ExplorerLoading /> : brands.isError ? (
            <div role="alert" className="py-16 text-center">
              <p>뉴스레터를 불러오지 못했어요.</p>
              <Button variant="ghost" size="compact" onClick={() => void brands.refetch()} className="mt-4">다시 시도</Button>
            </div>
          ) : !brands.data.length ? (
            <div className="py-16 text-center">
              <h2 className="font-bold">조건에 맞는 뉴스레터가 없어요.</h2>
              <p className="mt-2 text-sm text-caption-neutral">필터를 바꿔 다시 찾아보세요.</p>
              <Button variant="ghost" size="compact" onClick={() => updateParams({ industry: [], day: [], orderOpt: '' })} className="mt-4">전체 목록 보기</Button>
            </div>
          ) : <BrandList key={`${orderOpt}:${industries.join(',')}:${days.join(',')}:${isLoggedIn}`} brands={brands.data} isMember={isLoggedIn} />}
          </div>
        </div>

      {dialog === 'sort' && <ExplorerDialog title="정렬" onClose={() => setDialog(null)}>
        <div className="mt-7 divide-y divide-line-neutral">
          {([['인기순', '인기순'], ['최신순', '최신등록순']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={orderOpt === value} onClick={() => { updateParams({ orderOpt: value }); setDialog(null); }}
              className="flex h-14 w-full items-center justify-between text-left text-sm font-medium text-caption-strong">
              {label}{orderOpt === value && <span aria-hidden="true" className="text-lg text-primary">✓</span>}
            </button>
          ))}
        </div>
      </ExplorerDialog>}
      {dialog === 'filters' && <NewsletterFilters options={options.data} isError={options.isError} retry={() => void options.refetch()}
        industries={industries} days={days} onClose={() => setDialog(null)}
        onApply={(industry, day) => { updateParams({ industry, day }); setDialog(null); }} />}
    </section>
  );
}

function Chevron() {
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function FilterButton({ children, onClick, active, label }: { children: ReactNode; onClick: () => void; active: boolean; label: string }) {
  return <Chip as="button" active={active} aria-label={label} aria-haspopup="dialog" onClick={onClick}>
    {children}
  </Chip>;
}

const BrandList = memo(function BrandList({ brands, isMember }: { brands: NewsletterBrand[]; isMember: boolean }) {
  const [visibleCount, setVisibleCount] = useState(24);
  return <>
    <ul className="flex flex-col gap-3">
      {brands.slice(0, visibleCount).map((brand) => <BrandCard key={brand.brandId} brand={brand} isMember={isMember} />)}
    </ul>
    {visibleCount < brands.length && <Button variant="neutral-outline" size="compact" fullWidth onClick={() => setVisibleCount((count) => count + 24)} className="mt-6">뉴스레터 더 보기 ({visibleCount}/{brands.length})</Button>}
  </>;
});

const BrandCard = memo(function BrandCard({ brand, isMember }: { brand: NewsletterBrand; isMember: boolean }) {
  return <li>
    <Link href={`/newsletters/${brand.brandId}`} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-x-2 gap-y-[18px] rounded-[8px] border border-line-neutral bg-bg px-5 pt-4 pb-5 transition-colors hover:border-primary min-[1024px]:grid-cols-[56px_minmax(0,1fr)_auto_auto] min-[1024px]:gap-y-0 min-[1024px]:py-3">
      <span>
        <NewsletterImage name={brand.brandName} imageUrl={brand.imageUrl} variant="thumbnail" />
      </span>
      <div className="min-w-0">
        <h2 className="pt-0.5 text-base font-bold text-caption-heavy">{brand.brandName}</h2>
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-caption-neutral">{brand.shortDescription}</p>
      </div>
      {isMember && (brand.isSubscribed === 'CONFIRMED' || brand.isSubscribed === 'PAUSED') && <SubscriptionBadge status={brand.isSubscribed} />}
      {brand.interests.length > 0 && <div className="col-span-3 flex flex-wrap items-start gap-2 pt-1 min-[1024px]:col-span-1 min-[1024px]:col-start-4 min-[1024px]:row-start-1 min-[1024px]:ml-3 min-[1024px]:max-w-72 min-[1024px]:justify-end min-[1024px]:pt-0">
        {brand.interests.slice(0, 3).map((interest) => <Chip key={interest.id}>{interest.name}</Chip>)}
      </div>}
    </Link>
  </li>;
});
