'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import {
  subscriptionQueries,
  usePauseSubscription,
  useResumeSubscription,
  type SubscribedNewsletter,
} from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { proxyImage } from '@/shared/lib';
import { EmptyState } from '@/shared/ui';

type Tab = 'active' | 'paused';

export default function ExplorePage() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>('active');
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();

  const { data: activeNewsletters = [], isLoading: isActiveLoading } = useQuery({
    ...subscriptionQueries.active(),
    enabled: isLoggedIn && tab === 'active',
  });

  const { data: pausedNewsletters = [], isLoading: isPausedLoading } = useQuery({
    ...subscriptionQueries.paused(),
    enabled: isLoggedIn && tab === 'paused',
  });

  const currentList = tab === 'active' ? activeNewsletters : pausedNewsletters;
  const isLoading = tab === 'active' ? isActiveLoading : isPausedLoading;

  const handlePause = (id: number) => pauseMutation.mutate(id);
  const handleResume = (id: number) => resumeMutation.mutate(id);

  return (
    <div className="bg-bg min-h-[calc(100vh-49px)] flex flex-col">
      {/* 세그먼트 피커 */}
      <div className="flex pt-2 px-5 pb-4">
        <div className="relative flex w-full h-10 bg-bg-system rounded-md border border-neutral-150 p-0.5">
          <div
            className={clsx(
              'absolute top-0.5 h-9 w-[calc(50%-2px)] bg-bg rounded-md shadow-sm transition-[left] duration-300 ease-in-out',
              tab === 'active' ? 'left-0.5' : 'left-1/2',
            )}
          />
          <button
            type="button"
            onClick={() => setTab('active')}
            className={clsx(
              'flex-1 z-10 text-sm font-bold transition-colors',
              tab === 'active' ? 'text-caption-heavy' : 'text-caption-assistive',
            )}
          >
            구독 중
          </button>
          <button
            type="button"
            onClick={() => setTab('paused')}
            className={clsx(
              'flex-1 z-10 text-sm font-bold transition-colors',
              tab === 'paused' ? 'text-caption-heavy' : 'text-caption-assistive',
            )}
          >
            구독 중지
          </button>
        </div>
      </div>

      {!isLoggedIn ? (
        <EmptyState
          title="구독 중인 뉴스레터가 없어요."
          description=""
          cta={
            <Link href="/login" className="text-primary font-medium underline">
              로그인 후 뉴스레터를 구독해 보세요.
            </Link>
          }
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center flex-1 bg-bg-system text-primary">
          로딩 중...
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          title={
            tab === 'active'
              ? '구독 중인 뉴스레터가 없어요.'
              : '구독을 중지한 뉴스레터가 없어요.'
          }
          description={
            tab === 'active'
              ? '구독신청 후 첫 아티클을 수신받으면 내 구독에 추가돼요.'
              : '구독 중지 후에도 언제든 아티클을 다시 받아볼 수 있어요.'
          }
        />
      ) : (
        <>
          <div className="px-5 pt-8 pb-5">
            <p className="text-base font-bold text-caption-heavy mb-2">
              {tab === 'active'
                ? `총 ${currentList.length}개의 뉴스레터를 구독중이에요.`
                : `${currentList.length}개의 뉴스레터를 구독 중지했어요.`}
            </p>
            <p className="text-sm font-medium text-caption-neutral">
              {tab === 'active'
                ? '구독신청 후 첫 아티클을 수신받으면 내 구독에 추가돼요.'
                : '구독을 재개하면 다시 아티클을 받아볼 수 있어요.'}
            </p>
          </div>
          <div className="flex-1 bg-bg-system px-5 pb-7 flex flex-col gap-3">
            {currentList.map((nl) => (
              <SubscribeRow
                key={nl.id}
                newsletter={nl}
                isSubscribed={tab === 'active'}
                onAction={() =>
                  nl.id != null &&
                  (tab === 'active' ? handlePause(nl.id) : handleResume(nl.id))
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubscribeRow({
  newsletter,
  isSubscribed,
  onAction,
}: {
  newsletter: SubscribedNewsletter;
  isSubscribed: boolean;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 px-4 bg-bg rounded-xl border border-neutral-150 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
      <Link
        href={newsletter.id != null ? `/newsletters/${newsletter.id}` : '#'}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        {newsletter.imageUrl ? (
          <img
            src={proxyImage(newsletter.imageUrl)}
            alt={newsletter.brandName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-[10px] object-cover border border-neutral-150 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-[10px] bg-neutral-200/40 flex-shrink-0" />
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-bold text-caption-heavy truncate">
            {newsletter.brandName}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-caption-assistive">
            <img src="/images/Line Clock.svg" alt="" width={20} height={20} />
            {newsletter.publicationCycle}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onAction}
        className={clsx(
          'flex-shrink-0 px-3 py-1.5 bg-bg rounded text-[13px] font-medium border',
          isSubscribed
            ? 'border-neutral-150 text-caption-neutral'
            : 'border-primary text-primary',
        )}
      >
        {isSubscribed ? '구독중지' : '구독재개'}
      </button>
    </div>
  );
}
