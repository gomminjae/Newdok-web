'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import {
  newsletterQueries,
  newsletterKeys,
  type NewsletterDetail,
  type NewsletterBrand,
} from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { GuestNotice } from '@/shared/ui';

const CARD_WIDTH = 320;
const CARD_GAP = 12;
const STEP = CARD_WIDTH + CARD_GAP;

type Tab = 'recommend' | 'all';

export default function SearchPage() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>(isLoggedIn ? 'recommend' : 'all');
  const [orderOpt, setOrderOpt] = useState('인기순');
  const [industry, setIndustry] = useState<string | undefined>();
  const [day, setDay] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data: myRecommendation = [] } = useQuery({
    ...newsletterQueries.recommendIntersection(),
    enabled: isLoggedIn && tab === 'recommend',
  });

  const { data: unionRecommendation = [] } = useQuery({
    ...newsletterQueries.recommendUnion(),
    enabled: isLoggedIn && tab === 'recommend',
  });

  const { data: allNewsletters = [], isLoading: isAllLoading } = useQuery({
    ...newsletterQueries.list({ orderOpt, industry, day }, isLoggedIn),
    enabled: tab === 'all',
  });

  const handleRefreshRecommend = () => {
    queryClient.invalidateQueries({ queryKey: newsletterKeys.recommend.union() });
  };

  const handleResetFilters = () => {
    setOrderOpt('인기순');
    setIndustry(undefined);
    setDay(undefined);
  };

  return (
    <div className="bg-bg min-h-[calc(100vh-49px)] flex flex-col">
      {/* 탭 */}
      <div className="pt-4 relative">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab('recommend')}
            className={clsx(
              'flex-1 py-3 bg-transparent text-sm font-bold text-center transition-colors',
              tab === 'recommend' ? 'text-caption-strong' : 'text-caption-alternative',
            )}
          >
            추천 뉴스레터
          </button>
          <button
            type="button"
            onClick={() => setTab('all')}
            className={clsx(
              'flex-1 py-3 bg-transparent text-sm font-bold text-center transition-colors',
              tab === 'all' ? 'text-caption-strong' : 'text-caption-alternative',
            )}
          >
            모든 뉴스레터
          </button>
        </div>
        <div
          className={clsx(
            'h-0.5 bg-caption-strong w-1/2 transition-transform duration-300 ease-in-out',
            tab === 'all' && 'translate-x-full',
          )}
        />
      </div>
      <div className="h-px bg-neutral-150" />

      {tab === 'recommend' ? (
        isLoggedIn ? (
          <div className="flex-1 overflow-y-auto bg-bg-system">
            <p className="text-xl font-bold text-caption-heavy px-6 pt-5 whitespace-pre-line">
              {'맞춤형 뉴스레터가\n도착했어요.'}
            </p>

            {myRecommendation.length > 0 && (
              <InfiniteCarousel items={myRecommendation} />
            )}

            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <span className="text-base font-bold text-caption-strong">
                이런 뉴스레터는 어때요?
              </span>
              <button
                type="button"
                onClick={handleRefreshRecommend}
                className="flex items-center gap-1 bg-transparent text-sm font-medium text-primary"
              >
                <Image src="/images/Line Reload.svg" alt="새로고침" width={20} height={20} />
                새로고침
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-20">
              {unionRecommendation.map((nl) => (
                <NewsletterDetailRow key={nl.id} newsletter={nl} />
              ))}
            </div>
          </div>
        ) : (
          <GuestNotice />
        )
      ) : (
        <>
          <div className="bg-bg px-5 pt-5 pb-4 flex items-center gap-3">
            <div className="flex-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 bg-bg border border-neutral-150 rounded-[20px] text-sm font-medium text-caption-strong whitespace-nowrap"
              >
                {orderOpt}
                <Image src="/images/Line Down.svg" alt="" width={16} height={16} />
              </button>
              <div className="w-px h-5 bg-neutral-150 flex-shrink-0" />
              <button
                type="button"
                className={clsx(
                  'flex items-center gap-1 px-3 py-2 bg-bg border rounded-[20px] text-sm font-medium whitespace-nowrap',
                  industry
                    ? 'border-primary text-primary'
                    : 'border-neutral-150 text-caption-strong',
                )}
              >
                {industry ?? '산업'}
                <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
              </button>
              <button
                type="button"
                className={clsx(
                  'flex items-center gap-1 px-3 py-2 bg-bg border rounded-[20px] text-sm font-medium whitespace-nowrap',
                  day
                    ? 'border-primary text-primary'
                    : 'border-neutral-150 text-caption-strong',
                )}
              >
                {day ?? '발행요일'}
                <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex-shrink-0 bg-transparent flex items-center"
            >
              <Image src="/images/Line Reload.svg" alt="초기화" width={30} height={30} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-bg-system">
            <div className="flex flex-col gap-3 px-5 pt-3 pb-20">
              {isAllLoading ? (
                <div className="flex items-center justify-center py-10 text-caption-neutral">
                  로딩 중...
                </div>
              ) : (
                allNewsletters.map((nl) => (
                  <NewsletterBrandRow key={nl.brandId} brand={nl} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfiniteCarousel({ items }: { items: NewsletterDetail[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorCount = Math.min(5, items.length);

  const extendedItems = [...items, ...items, ...items];
  const baseOffset = items.length;

  const getTranslateX = () => {
    const idx = baseOffset + currentIndex;
    return -(idx * STEP) + 24 + dragOffset;
  };

  const normalizeIndex = (idx: number) =>
    ((idx % items.length) + items.length) % items.length;

  const goNext = useCallback(() => setCurrentIndex((prev) => prev + 1), []);
  const goPrev = useCallback(() => setCurrentIndex((prev) => prev - 1), []);

  useEffect(() => {
    if (currentIndex >= items.length || currentIndex < -items.length) {
      const timeout = setTimeout(() => {
        const el = trackRef.current;
        if (el) el.style.transition = 'none';
        setCurrentIndex(normalizeIndex(currentIndex));
        requestAnimationFrame(() => {
          if (el) el.style.transition = '';
        });
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, items.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };
  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = CARD_WIDTH / 4;
    if (dragOffset < -threshold) goNext();
    else if (dragOffset > threshold) goPrev();
    setDragOffset(0);
  };

  const handleDotClick = (dotIndex: number) => {
    const current = normalizeIndex(currentIndex);
    setCurrentIndex(currentIndex + (dotIndex - current));
  };

  return (
    <>
      <div
        className="overflow-hidden py-5 cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex gap-3"
          style={{
            transform: `translateX(${getTranslateX()}px)`,
            transition: isDragging ? 'none' : 'transform 0.35s ease-out',
          }}
        >
          {extendedItems.map((nl, i) => (
            <RecommendedCard key={`${nl.id}-${i}`} newsletter={nl} />
          ))}
        </div>
      </div>
      {indicatorCount > 0 && (
        <div className="flex justify-center gap-1.5 pb-5">
          {Array.from({ length: indicatorCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleDotClick(i)}
              className={clsx(
                'w-1.5 h-1.5 rounded-full p-0',
                i === normalizeIndex(currentIndex) % indicatorCount
                  ? 'bg-primary'
                  : 'bg-tint-200',
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

function RecommendedCard({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link
      href={`/newsletters/${newsletter.id}`}
      className="flex-shrink-0 w-80 bg-bg rounded-xl border border-neutral-150 overflow-hidden transition-shadow hover:shadow-md"
    >
      {newsletter.imageUrl ? (
        <Image
          src={newsletter.imageUrl}
          alt={newsletter.brandName}
          width={320}
          height={210}
          className="w-full h-[210px] object-cover"
        />
      ) : (
        <div className="w-full h-[210px] flex items-center justify-center text-2xl font-bold text-primary bg-gradient-to-br from-tint-50 to-tint-100">
          {newsletter.brandName}
        </div>
      )}
      <div className="p-4">
        <p className="text-base font-bold text-caption-heavy mb-2">
          {newsletter.brandName}
        </p>
        <p className="text-sm font-medium text-caption-neutral line-clamp-2 h-10 mb-3">
          {newsletter.firstDescription}
        </p>
        <div className="flex gap-1.5 overflow-hidden">
          {newsletter.interests.slice(0, 3).map((interest) => (
            <span
              key={interest.id}
              className="text-xs text-caption-strong px-2.5 py-1.5 bg-bg border border-neutral-150 rounded-2xl whitespace-nowrap"
            >
              {interest.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function NewsletterDetailRow({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link
      href={`/newsletters/${newsletter.id}`}
      className="block bg-bg rounded-lg border border-neutral-150 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="flex gap-2 pb-4">
        {newsletter.imageUrl ? (
          <Image
            src={newsletter.imageUrl}
            alt={newsletter.brandName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-[10px] object-cover border border-neutral-150 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-[10px] bg-neutral-200/40 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-caption-heavy pt-0.5 mb-3">
            {newsletter.brandName}
          </p>
          <p className="text-sm font-medium text-caption-neutral line-clamp-2">
            {newsletter.firstDescription}
          </p>
        </div>
      </div>
      {newsletter.interests.length > 0 && (
        <div className="flex gap-2 pt-1">
          {newsletter.interests.slice(0, 3).map((interest) => (
            <span
              key={interest.id}
              className="text-xs text-caption-strong px-2.5 py-1.5 bg-bg border border-neutral-150 rounded-2xl whitespace-nowrap"
            >
              {interest.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function NewsletterBrandRow({ brand }: { brand: NewsletterBrand }) {
  return (
    <Link
      href={`/newsletters/${brand.brandId}`}
      className="block bg-bg rounded-lg border border-neutral-150 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="flex gap-2 pb-4">
        {brand.imageUrl ? (
          <Image
            src={brand.imageUrl}
            alt={brand.brandName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-[10px] object-cover border border-neutral-150 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-[10px] bg-neutral-200/40 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-caption-heavy pt-0.5 mb-3">
            {brand.brandName}
          </p>
          <p className="text-sm font-medium text-caption-neutral line-clamp-2">
            {brand.shortDescription}
          </p>
        </div>
      </div>
      {brand.interests.length > 0 && (
        <div className="flex gap-2 pt-1">
          {brand.interests.slice(0, 3).map((interest) => (
            <span
              key={interest.id}
              className="text-xs text-caption-strong px-2.5 py-1.5 bg-bg border border-neutral-150 rounded-2xl whitespace-nowrap"
            >
              {interest.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
