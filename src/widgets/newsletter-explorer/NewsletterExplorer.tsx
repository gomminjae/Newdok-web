'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { newsletterApi, newsletterQueries, type NewsletterBrand } from '@/entities/newsletter';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

export function NewsletterExplorer() {
  return <Suspense fallback={<ExplorerLoading />}><ExplorerContent /></Suspense>;
}

function ExplorerLoading() {
  return <p role="status" className="py-16 text-center text-caption-neutral">뉴스레터를 불러오는 중이에요.</p>;
}

function ExplorerContent() {
  const router = useRouter();
  const pathname = usePathname() ?? '/search';
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const keyword = (searchParams.get('q') ?? '').slice(0, 100);
  const orderOpt = searchParams.get('orderOpt') === '최신순' ? '최신순' : '인기순';
  const rawIndustry = searchParams.get('industry') ?? '';
  const rawDay = searchParams.get('day') ?? '';
  const industry = /^[1-9]\d*$/.test(rawIndustry) ? rawIndustry : undefined;
  const day = /^[1-7]$/.test(rawDay) ? rawDay : undefined;
  const options = useQuery({ queryKey: ['newsletter', 'options'], queryFn: newsletterApi.fetchOptionList, staleTime: 3_600_000 });
  const brands = useQuery(newsletterQueries.list({ orderOpt, industry, day }, false));
  const normalizedKeyword = keyword.replace(/\s/g, '').toLocaleLowerCase();
  const filtered = (brands.data ?? []).filter((brand) =>
    brand.brandName.replace(/\s/g, '').toLocaleLowerCase().includes(normalizedKeyword),
  );

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilter('q', String(new FormData(event.currentTarget).get('q') ?? '').trim());
  }

  const resetFilters = () => router.replace(pathname, { scroll: false });
  const hasFilters = !!keyword || !!industry || !!day || orderOpt !== '인기순';
  const selectClass = 'mt-1.5 min-h-11 w-full min-w-0 rounded-lg border border-line-alternative bg-bg px-3 text-sm text-caption-strong focus:border-primary';

  return (
    <section className="mx-auto w-full max-w-6xl py-5 sm:py-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold tracking-widest text-primary">DISCOVER NEWDOK</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">나에게 맞는 뉴스레터 찾기</h1>
        <p className="mt-3 text-sm leading-6 text-caption-neutral">로그인 없이 둘러보고, 지난 아티클부터 읽어보세요.</p>
      </div>
      <form role="search" onSubmit={search} className="flex gap-2">
        <label htmlFor="newsletter-keyword" className="sr-only">뉴스레터 이름</label>
        <input key={keyword} id="newsletter-keyword" name="q" type="search" defaultValue={keyword}
          placeholder="어떤 뉴스레터를 찾으세요?" maxLength={100}
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-line-alternative bg-bg px-4 text-base outline-none focus:border-primary" />
        <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-strong">검색</button>
      </form>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="min-w-0 text-xs font-medium text-caption-neutral">정렬
          <select value={orderOpt} onChange={(e) => updateFilter('orderOpt', e.target.value)} className={selectClass}>
            <option value="인기순">인기순</option><option value="최신순">최신순</option>
          </select>
        </label>
        <label className="min-w-0 text-xs font-medium text-caption-neutral">산업
          <select value={industry ?? ''} disabled={!options.data} onChange={(e) => updateFilter('industry', e.target.value)} className={selectClass}>
            <option value="">모든 산업</option>
            {options.data?.industries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs font-medium text-caption-neutral">발행 요일
          <select value={day ?? ''} disabled={!options.data} onChange={(e) => updateFilter('day', e.target.value)} className={selectClass}>
            <option value="">모든 요일</option>
            {options.data?.days.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <button type="button" disabled={!hasFilters} onClick={resetFilters}
          className="min-h-11 self-end rounded-lg px-3 text-sm text-caption-neutral underline underline-offset-4 disabled:opacity-40">초기화</button>
      </div>
      {options.isError && <p role="alert" className="mt-3 text-sm text-caption-neutral">필터를 불러오지 못했어요. <button type="button" onClick={() => void options.refetch()} className="text-primary underline">다시 시도</button></p>}
      <div className="mb-4 mt-8 flex items-center justify-between border-t border-line-disabled pt-6">
        <h2 className="min-w-0 break-words text-base font-bold">{keyword ? `‘${keyword}’ 검색 결과` : '모든 뉴스레터'}</h2>
        <p aria-live="polite" className="shrink-0 pl-3 text-sm text-caption-neutral">{brands.isPending ? '불러오는 중' : `${filtered.length}개`}</p>
      </div>
      {brands.isPending ? <ExplorerLoading /> : brands.isError ? (
        <div role="alert" className="rounded-xl bg-bg-system px-5 py-12 text-center">
          <p>뉴스레터를 불러오지 못했어요.</p>
          <button type="button" onClick={() => void brands.refetch()} className="mt-4 min-h-11 rounded-lg bg-primary px-6 font-bold text-white">다시 시도</button>
        </div>
      ) : !filtered.length ? (
        <div className="rounded-xl bg-bg-system px-5 py-12 text-center">
          <h3 className="font-bold">조건에 맞는 뉴스레터가 없어요.</h3>
          <p className="mt-2 text-sm text-caption-neutral">검색어나 필터를 바꿔 다시 찾아보세요.</p>
          <button type="button" onClick={resetFilters} className="mt-4 min-h-11 px-4 font-bold text-primary">전체 뉴스레터 보기</button>
        </div>
      ) : <BrandResults key={`${keyword}/${orderOpt}/${industry}/${day}`} brands={filtered} />}
    </section>
  );
}

function BrandResults({ brands }: { brands: NewsletterBrand[] }) {
  const [visibleCount, setVisibleCount] = useState(18);
  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.slice(0, visibleCount).map((brand) => (
          <li key={brand.brandId} className="min-w-0">
            <Link href={`/newsletters/${brand.brandId}`} className="flex h-full flex-col rounded-xl border border-line-disabled bg-bg p-5 transition-colors hover:border-primary hover:bg-tint-50/30">
              <span className="flex min-w-0 items-center gap-3">
                <NewsletterImage name={brand.brandName} imageUrl={brand.imageUrl} />
                <strong className="min-w-0 break-words text-base">{brand.brandName}</strong>
              </span>
              <span className="my-4 line-clamp-2 text-sm leading-6 text-caption-neutral">{brand.shortDescription}</span>
              <span className="mt-auto flex flex-wrap gap-1.5">
                {brand.interests.slice(0, 3).map((interest) => <span key={interest.id} className="rounded-full bg-bg-system px-2.5 py-1 text-xs text-caption-neutral">{interest.name}</span>)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visibleCount < brands.length && <div className="mt-8 text-center">
        <button type="button" onClick={() => setVisibleCount((count) => count + 18)} className="min-h-12 w-full rounded-xl border border-line-alternative bg-bg px-8 text-sm font-bold hover:bg-bg-system sm:w-auto">뉴스레터 더 보기 ({Math.min(visibleCount, brands.length)}/{brands.length})</button>
      </div>}
    </>
  );
}
