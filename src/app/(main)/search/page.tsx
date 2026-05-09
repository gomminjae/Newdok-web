'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from '@/shared/api/endpoints';
import type { NewsletterDetail, NewsletterBrand } from '@/shared/api/types';
import styles from './explore.module.scss';

export default function SearchPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [orderOpt, setOrderOpt] = useState('인기순');
  const [industry, setIndustry] = useState<string | undefined>();
  const [day, setDay] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data: myRecommendation = [] } = useQuery({
    queryKey: ['recommend', 'intersection'],
    queryFn: () => newsletterApi.fetchRecommendIntersection(),
    enabled: selectedTab === 0,
  });

  const { data: unionRecommendation = [] } = useQuery({
    queryKey: ['recommend', 'union'],
    queryFn: () => newsletterApi.fetchRecommendUnion(),
    enabled: selectedTab === 0,
  });

  const { data: allNewsletters = [], isLoading: isAllLoading } = useQuery({
    queryKey: ['newsletters', 'all', orderOpt, industry, day],
    queryFn: () =>
      newsletterApi.fetchAllNewsletterBrands({ orderOpt, industry, day }),
    enabled: selectedTab === 1,
  });

  const handleRefreshRecommend = () => {
    queryClient.invalidateQueries({ queryKey: ['recommend', 'union'] });
  };

  const handleResetFilters = () => {
    setOrderOpt('인기순');
    setIndustry(undefined);
    setDay(undefined);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabSwitcher}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${selectedTab === 0 ? styles.active : ''}`}
            onClick={() => setSelectedTab(0)}
            type="button"
          >
            추천 뉴스레터
          </button>
          <button
            className={`${styles.tabButton} ${selectedTab === 1 ? styles.active : ''}`}
            onClick={() => setSelectedTab(1)}
            type="button"
          >
            모든 뉴스레터
          </button>
        </div>
        <div className={`${styles.tabIndicator} ${selectedTab === 1 ? styles.right : ''}`} />
      </div>
      <div className={styles.divider} />

      {selectedTab === 0 ? (
        <div className={styles.recommendSection}>
          <p className={styles.recommendTitle}>
            {'맞춤형 뉴스레터가\n도착했어요.'}
          </p>

          {myRecommendation.length > 0 && (
            <InfiniteCarousel items={myRecommendation} />
          )}

          <div className={styles.suggestHeader}>
            <span className={styles.suggestTitle}>이런 뉴스레터는 어때요?</span>
            <button className={styles.suggestRefresh} type="button" onClick={handleRefreshRecommend}>
              <Image src="/images/Line Reload.svg" alt="새로고침" width={20} height={20} />
              새로고침
            </button>
          </div>

          <div className={styles.newsletterList}>
            {unionRecommendation.map((nl) => (
              <NewsletterDetailRow key={nl.id} newsletter={nl} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.filterSection}>
            <div className={styles.filterScroll}>
              <button className={styles.filterChip} type="button">
                {orderOpt}
                <Image src="/images/Line Down.svg" alt="" width={16} height={16} />
              </button>
              <div className={styles.filterDivider} />
              <button className={`${styles.filterChip} ${industry ? styles.active : ''}`} type="button">
                {industry ?? '산업'}
                <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
              </button>
              <button className={`${styles.filterChip} ${day ? styles.active : ''}`} type="button">
                {day ?? '발행요일'}
                <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
              </button>
            </div>
            <button className={styles.filterRefresh} type="button" onClick={handleResetFilters}>
              <Image src="/images/Line Reload.svg" alt="초기화" width={30} height={30} />
            </button>
          </div>
          <div className={styles.allNewsletterList}>
            <div className={styles.allNewsletterListInner}>
              {isAllLoading ? (
                <div className={styles.guestSection}>로딩 중...</div>
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

const CARD_WIDTH = 320;
const CARD_GAP = 12;
const STEP = CARD_WIDTH + CARD_GAP;

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

  const normalizeIndex = (idx: number) => ((idx % items.length) + items.length) % items.length;

  const goNext = useCallback(() => setCurrentIndex((prev) => prev + 1), []);
  const goPrev = useCallback(() => setCurrentIndex((prev) => prev - 1), []);

  useEffect(() => {
    if (currentIndex >= items.length || currentIndex < -items.length) {
      const timeout = setTimeout(() => {
        const el = trackRef.current;
        if (el) el.style.transition = 'none';
        setCurrentIndex(normalizeIndex(currentIndex));
        requestAnimationFrame(() => { if (el) el.style.transition = ''; });
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
        className={styles.carouselWrapper}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className={styles.carouselTrack}
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
        <div className={styles.pageIndicator}>
          {Array.from({ length: indicatorCount }, (_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === normalizeIndex(currentIndex) % indicatorCount ? styles.active : ''}`}
              onClick={() => handleDotClick(i)}
              type="button"
            />
          ))}
        </div>
      )}
    </>
  );
}

function RecommendedCard({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link href={`/newsletters/${newsletter.id}`} className={styles.carouselCard}>
      {newsletter.imageUrl ? (
        <img src={newsletter.imageUrl} alt={newsletter.brandName} className={styles.carouselImage} />
      ) : (
        <div className={styles.carouselImagePlaceholder}>{newsletter.brandName}</div>
      )}
      <div className={styles.carouselInfo}>
        <p className={styles.carouselBrand}>{newsletter.brandName}</p>
        <p className={styles.carouselDesc}>{newsletter.firstDescription}</p>
        <div className={styles.carouselTags}>
          {newsletter.interests.slice(0, 3).map((interest) => (
            <span key={interest.id} className={styles.tag}>{interest.name}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function NewsletterDetailRow({ newsletter }: { newsletter: NewsletterDetail }) {
  return (
    <Link href={`/newsletters/${newsletter.id}`} className={styles.newsletterRow}>
      <div className={styles.newsletterRowTop}>
        {newsletter.imageUrl ? (
          <img src={newsletter.imageUrl} alt={newsletter.brandName} className={styles.newsletterImage} />
        ) : (
          <div className={styles.newsletterImagePlaceholder} />
        )}
        <div className={styles.newsletterInfo}>
          <p className={styles.newsletterBrand}>{newsletter.brandName}</p>
          <p className={styles.newsletterDesc}>{newsletter.firstDescription}</p>
        </div>
      </div>
      {newsletter.interests.length > 0 && (
        <div className={styles.newsletterTags}>
          {newsletter.interests.slice(0, 3).map((interest) => (
            <span key={interest.id} className={styles.tag}>{interest.name}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

function NewsletterBrandRow({ brand }: { brand: NewsletterBrand }) {
  return (
    <Link href={`/newsletters/${brand.brandId}`} className={styles.newsletterRow}>
      <div className={styles.newsletterRowTop}>
        {brand.imageUrl ? (
          <img src={brand.imageUrl} alt={brand.brandName} className={styles.newsletterImage} />
        ) : (
          <div className={styles.newsletterImagePlaceholder} />
        )}
        <div className={styles.newsletterInfo}>
          <p className={styles.newsletterBrand}>{brand.brandName}</p>
          <p className={styles.newsletterDesc}>{brand.shortDescription}</p>
        </div>
      </div>
      {brand.interests.length > 0 && (
        <div className={styles.newsletterTags}>
          {brand.interests.slice(0, 3).map((interest) => (
            <span key={interest.id} className={styles.tag}>{interest.name}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
