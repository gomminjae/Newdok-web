'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsletterQueries } from '@/entities/newsletter';
import { NewsletterImage } from './NewsletterImage';
import { NewsletterListState } from './NewsletterListState';

export function PopularNewsletters() {
  const listRef = useRef<HTMLUListElement>(null);
  const { data: newsletters = [], isPending, isError, refetch } = useQuery(newsletterQueries.landingPopular());

  const scrollCards = (direction: -1 | 1) => {
    listRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="popular-newsletters" className="bg-bg px-5 py-9 sm:px-8 sm:py-11">
      <div className="mx-auto w-full max-w-6xl">
        <h2 id="popular-newsletters" className="mb-4 text-base font-bold text-primary sm:text-lg">
          지금 인기 있는 뉴스레터
        </h2>
        <NewsletterListState isPending={isPending} isError={isError} isEmpty={!newsletters.length} retry={refetch} />
        {!isPending && !isError && newsletters.length > 0 && (
        <div className="relative">
          <ul
            ref={listRef}
            className="landing-scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 py-0.5"
          >
            {newsletters.map((newsletter) => (
              <li
                key={newsletter.brandId}
                className="w-[86%] flex-none snap-start sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]"
              >
                <Link
                  href={`/newsletters/${newsletter.brandId}`}
                  className="flex h-full min-h-28 gap-3 rounded-xl border border-line-disabled bg-bg p-3 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-bold text-caption-heavy">
                      {newsletter.brandName}
                    </strong>
                    <span className="mt-1 block text-xs leading-snug text-caption-neutral">
                      {newsletter.shortDescription}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {newsletter.interests.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full border border-primary px-2 py-0.5 text-[10px] text-primary"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {newsletters.length > 1 && <button
            type="button"
            onClick={() => scrollCards(-1)}
            aria-label="이전 인기 뉴스레터 보기"
            className="absolute -left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl text-caption-alternative shadow-md transition-colors hover:text-caption-heavy sm:flex"
          >
            ‹
          </button>}
          {newsletters.length > 1 && <button
            type="button"
            onClick={() => scrollCards(1)}
            aria-label="다음 인기 뉴스레터 보기"
            className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl text-caption-alternative shadow-md transition-colors hover:text-caption-heavy sm:flex"
          >
            ›
          </button>}
        </div>
        )}
      </div>
    </section>
  );
}
