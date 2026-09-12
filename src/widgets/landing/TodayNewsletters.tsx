'use client';

import { Chip } from '@/shared/ui';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { newsletterQueries } from '@/entities/newsletter';
import { NewsletterImage } from './NewsletterImage';
import { NewsletterListState } from './NewsletterListState';

export function TodayNewsletters() {
  const tomorrow = useQuery(newsletterQueries.landingTomorrow());
  const newest = useQuery(newsletterQueries.landingNewest());

  return (
    <section className="px-5 pb-12 sm:px-8 sm:pb-14">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-4 text-base font-bold text-caption-heavy sm:text-lg">
          내일 발행되는 뉴스레터
        </h2>
        <NewsletterListState
          isPending={tomorrow.isPending}
          isError={tomorrow.isError}
          isEmpty={!tomorrow.data?.length}
          retry={tomorrow.refetch}
          emptyMessage="내일 발행 예정인 뉴스레터가 없어요. 다른 뉴스레터도 둘러보세요."
        />
        {!tomorrow.isPending && !tomorrow.isError && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tomorrow.data?.map((newsletter) => (
              <li key={newsletter.brandId}>
                <Link
                  href={`/newsletters/${newsletter.brandId}`}
                  className="block h-full overflow-hidden rounded-xl border border-line-neutral bg-bg transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} cover />
                  <span className="block p-3">
                    <strong className="block text-sm font-bold text-caption-heavy">{newsletter.brandName}</strong>
                    <span className="mt-1.5 block text-xs leading-snug text-caption-alternative">{newsletter.shortDescription}</span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {newsletter.interests.slice(0, 2).map((interest) => (
                        <Chip key={interest.id}>{interest.name}</Chip>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-4 mt-10 text-base font-bold text-caption-heavy sm:text-lg">
          NEW! 새로 등록된 뉴스레터
        </h2>
        <NewsletterListState
          isPending={newest.isPending}
          isError={newest.isError}
          isEmpty={!newest.data?.length}
          retry={newest.refetch}
        />
        {!newest.isPending && !newest.isError && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {newest.data?.map((newsletter) => (
              <li key={newsletter.brandId}>
                <Link
                  href={`/newsletters/${newsletter.brandId}`}
                  className="flex items-center gap-3 rounded-xl border border-line-neutral bg-bg p-3 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-bold text-caption-heavy">{newsletter.brandName}</strong>
                    <span className="mt-0.5 block truncate text-xs text-caption-alternative">{newsletter.shortDescription}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
