'use client';

import { memo, Suspense, useState, type ReactNode } from 'react';
import { redirect, usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { newsletterApi, newsletterQueries, type NewsletterBrand } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { replacePageUrl } from '@/shared/lib/dialog-history';
import { CardLink, FilterToolbar, Button, Chip, GuestNotice, Icon, SubscriptionBadge, Tabs } from '@/shared/ui';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';
import { ExplorerDialog, NewsletterFilters } from './NewsletterFilters';
import { NewsletterRecommendations } from './NewsletterRecommendations';
import { NewsletterListSkeleton, RecommendationsSkeleton } from './NewsletterSkeleton';

type ExplorerTab = 'recommend' | 'all';
const EXPLORER_TABS = [
  { value: 'recommend', label: '추천 뉴스레터' },
  { value: 'all', label: '모든 뉴스레터' },
] as const;
const noop = () => {};

function ExplorerFrame({ tab, pending = false, onTabChange = noop, children }: {
  tab?: ExplorerTab;
  pending?: boolean;
  onTabChange?: (tab: ExplorerTab) => void;
  children: ReactNode;
}) {
  return <section aria-label="뉴스레터 둘러보기" aria-busy={pending} className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg-system md:-mx-6 md:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
    <Tabs id="newsletter" label="뉴스레터 목록" value={tab} options={EXPLORER_TABS} disabled={pending} onChange={onTabChange} />
    {children}
  </section>;
}

function ExplorerLoading({ initialBrands }: { initialBrands?: NewsletterBrand[] }) {
  return <ExplorerFrame tab={initialBrands ? 'all' : undefined} pending>
    {initialBrands ? <div role="tabpanel" id="newsletter-panel-all" aria-labelledby="newsletter-tab-all" className="flex-1 pb-20">
      <ExplorerToolbar orderOpt="인기순" industries={0} days={0} disabled />
      <div className="px-4 md:px-6 min-[1024px]:px-8"><BrandList brands={initialBrands} isMember={false} /></div>
    </div> : <RecommendationsSkeleton />}
  </ExplorerFrame>;
}

export function NewsletterExplorer({ initialBrands }: { initialBrands?: NewsletterBrand[] }) {
  return <Suspense fallback={<ExplorerLoading initialBrands={initialBrands} />}><ExplorerRoute initialBrands={initialBrands} /></Suspense>;
}

function ExplorerRoute({ initialBrands }: { initialBrands?: NewsletterBrand[] }) {
  const params = useSearchParams();
  if (params?.get('search') === '1' || params?.get('q')) {
    const query = new URLSearchParams();
    const keyword = (params.get('q') ?? '').slice(0, 100);
    if (keyword) query.set('q', keyword);
    redirect(`/search${keyword ? `?${query}` : ''}`);
  }
  return <ExplorerContent initialBrands={initialBrands} />;
}

function readIds(params: URLSearchParams, key: string) {
  return [...new Set(params.getAll(key).filter((id) => /^[1-9]\d*$/.test(id)))].sort((a, b) => Number(a) - Number(b));
}

function ExplorerContent({ initialBrands }: { initialBrands?: NewsletterBrand[] }) {
  const { isLoggedIn, isHydrated } = useAuth();
  const pathname = usePathname() ?? '/explore';
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const requestedTab = searchParams.get('tab');
  const hasSearch = ['industry', 'day', 'orderOpt'].some((key) => searchParams.has(key));
  const tab = requestedTab === 'recommend' || requestedTab === 'all'
    ? requestedTab : pathname === '/newsletters' || hasSearch || !isLoggedIn ? 'all' : 'recommend';
  const orderOpt = searchParams.get('orderOpt') === '최신순' ? '최신순' : '인기순';
  const industries = readIds(searchParams, 'industry');
  const days = readIds(searchParams, 'day');
  const [dialog, setDialog] = useState<'sort' | 'filters' | null>(null);
  const options = useQuery({ queryKey: ['newsletter', 'options'], queryFn: ({ signal }) => newsletterApi.fetchOptionList(signal), staleTime: 3_600_000, enabled: dialog === 'filters' });
  const brands = useQuery({
    ...newsletterQueries.list({ orderOpt, industry: industries, day: days }, isLoggedIn),
    enabled: isHydrated && tab === 'all',
    initialData: !isLoggedIn && orderOpt === '인기순' && industries.length === 0 && days.length === 0 ? initialBrands : undefined,
    placeholderData: isLoggedIn && orderOpt === '인기순' && industries.length === 0 && days.length === 0 ? initialBrands : undefined,
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
    replacePageUrl(`${pathname}?${params}${window.location.hash}`);
  }

  function resetFilters() {
    updateParams({ industry: [], day: [], orderOpt: '' });
  }

  if (!isHydrated) return <ExplorerLoading initialBrands={initialBrands} />;

  return (
    <ExplorerFrame tab={tab} onTabChange={(value) => updateParams({ tab: value })}>
        <div hidden={tab !== 'recommend'} role="tabpanel" id="newsletter-panel-recommend" aria-labelledby="newsletter-tab-recommend" className={tab === 'recommend' ? 'page-enter' : undefined}>
          {isLoggedIn ? <NewsletterRecommendations active={tab === 'recommend'} /> : <GuestNotice />}
        </div>
        <div hidden={tab !== 'all'} role="tabpanel" id="newsletter-panel-all" aria-labelledby="newsletter-tab-all" className={clsx('flex-1 pb-20', tab === 'all' && 'page-enter')}>
          <ExplorerToolbar orderOpt={orderOpt} industries={industries.length} days={days.length}
            onSort={() => setDialog('sort')} onFilters={() => setDialog('filters')} onReset={resetFilters} />

          <div className="px-4 md:px-6 min-[1024px]:px-8">
          {brands.isPending ? <NewsletterListSkeleton /> : brands.isError ? (
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
            <Button key={value} variant="menu" fullWidth aria-pressed={orderOpt === value} onClick={() => { updateParams({ orderOpt: value }); setDialog(null); }}>
              {label}{orderOpt === value && <span className="text-primary"><Icon name="Line Checkmark" size={24} /></span>}
            </Button>
          ))}
        </div>
      </ExplorerDialog>}
      {dialog === 'filters' && <NewsletterFilters options={options.data} isError={options.isError} retry={() => void options.refetch()}
        industries={industries} days={days} onClose={() => setDialog(null)}
        onApply={(industry, day) => { updateParams({ industry, day }); setDialog(null); }} />}
    </ExplorerFrame>
  );
}

function ExplorerToolbar({ orderOpt, industries, days, disabled = false, onSort = noop, onFilters = noop, onReset = noop }: {
  orderOpt: string;
  industries: number;
  days: number;
  disabled?: boolean;
  onSort?: () => void;
  onFilters?: () => void;
  onReset?: () => void;
}) {
  const orderLabel = orderOpt === '최신순' ? '최신등록순' : '인기순';
  return <FilterToolbar label="뉴스레터 필터" className="px-4 py-4 md:px-6 min-[1024px]:px-8"
    actions={<Button variant="ghost" size="xs" disabled={disabled} onClick={onReset} aria-label="필터 초기화"><Icon name="Line Reload" size={16} />초기화</Button>}>
    <FilterButton onClick={onSort} disabled={disabled} active={false} label={`${orderLabel} 정렬`}>
      {orderLabel} <Icon name="Line Arrow Transfer" size={16} />
    </FilterButton>
    <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line-neutral" />
    <FilterButton onClick={onFilters} disabled={disabled} active={industries > 0} muted={!industries} label={`산업 필터${industries ? ` ${industries}개 선택` : ''}`}>
      산업{industries > 0 && ` ${industries}`} <Icon name="Line Down" size={20} />
    </FilterButton>
    <FilterButton onClick={onFilters} disabled={disabled} active={days > 0} muted={!days} label={`발행 요일 필터${days ? ` ${days}개 선택` : ''}`}>
      발행 요일{days > 0 && ` ${days}`} <Icon name="Line Down" size={20} />
    </FilterButton>
  </FilterToolbar>;
}

function FilterButton({ children, onClick, active, label, muted = false, disabled = false }: { children: ReactNode; onClick: () => void; active: boolean; label: string; muted?: boolean; disabled?: boolean }) {
  return <Chip as="button" variant="filter" active={active} tone={muted ? 'muted' : 'neutral'} disabled={disabled} aria-label={label} aria-haspopup="dialog" onClick={onClick}>
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
  return <li><CardLink href={`/newsletters/${brand.brandId}`} prefetch={false} className="flex items-start gap-2 bg-bg p-4 transition-colors ">
    <NewsletterImage name={brand.brandName} imageUrl={brand.imageUrl} variant="thumbnail" />
    <div className="min-w-0 flex-1 xl:flex xl:items-center xl:justify-between xl:gap-5">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><h2 className="text-base font-bold text-caption-heavy">{brand.brandName}</h2>{isMember && (brand.isSubscribed === 'CONFIRMED' || brand.isSubscribed === 'PAUSED') && <SubscriptionBadge status={brand.isSubscribed} />}</div><p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[18px] text-caption-neutral">{brand.shortDescription}</p></div>
      {brand.interests.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 xl:mt-0 xl:max-w-80 xl:justify-end">{brand.interests.slice(0, 3).map((interest) => <Chip key={interest.id}>{interest.name}</Chip>)}</div>}
    </div>
  </CardLink></li>;
});
