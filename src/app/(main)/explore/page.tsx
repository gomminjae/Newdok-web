'use client';

import Link from 'next/link';
import { memo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  subscriptionQueries,
  usePauseSubscription,
  useResumeSubscription,
  type SubscribedNewsletter,
} from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { Button, Icon, SegmentPicker } from '@/shared/ui';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

type Tab = 'active' | 'paused';
const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: 'active', label: '구독 중' },
  { value: 'paused', label: '구독 중지' },
];

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

  const pause = pauseMutation.mutate;
  const resume = resumeMutation.mutate;
  const handleAction = useCallback((id: number) => {
    if (tab === 'active') pause(id);
    else resume(id);
  }, [pause, resume, tab]);
  const pendingId = pauseMutation.isPending ? pauseMutation.variables
    : resumeMutation.isPending ? resumeMutation.variables : undefined;

  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
      {/* 세그먼트 피커 */}
      <div className="flex px-5 pb-[18px] pt-2">
        <SegmentPicker value={tab} options={TABS} onChange={setTab} className="w-full" />
      </div>

      {!isLoggedIn ? (
        <SubscriptionEmpty tab={tab} guest />
      ) : isLoading ? (
        <div className="flex items-center justify-center flex-1 bg-bg-system text-primary">
          로딩 중...
        </div>
      ) : currentList.length === 0 ? (
        <SubscriptionEmpty tab={tab} />
      ) : (
        <>
          <div className="bg-bg-system px-5 pb-5 pt-[30px]">
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
                isPending={nl.id === pendingId}
                onAction={handleAction}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubscriptionEmpty({ tab, guest = false }: { tab: Tab; guest?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center bg-bg-system px-5 pb-8 text-center">
      <img src="/images/app/nosubscribe.png" alt="" width={280} height={280} className="mb-6 mt-5 h-[280px] w-[280px] max-w-full object-contain" />
      <p className="mb-1 text-base font-bold text-caption-heavy">
        {tab === 'active' ? '구독 중인 뉴스레터가 없어요.' : '구독을 중지한 뉴스레터가 없어요.'}
      </p>
      <p className="text-sm font-medium text-caption-neutral">
        {guest ? <><Link href="/login" className="text-primary underline underline-offset-2">로그인</Link> 후 뉴스레터를 구독해 보세요.</>
          : tab === 'active' ? '구독신청 후 첫 아티클을 수신받으면 내 구독에 추가돼요.'
            : '구독 중지 후에도 언제든 아티클을 다시 받아볼 수 있어요.'}
      </p>
    </div>
  );
}

const SubscribeRow = memo(function SubscribeRow({
  newsletter,
  isSubscribed,
  isPending,
  onAction,
}: {
  newsletter: SubscribedNewsletter;
  isSubscribed: boolean;
  isPending: boolean;
  onAction: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line-neutral bg-bg px-4 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
      <Link
        href={newsletter.id != null ? `/newsletters/${newsletter.id}` : '#'}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} variant="thumbnail" />
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-bold text-caption-heavy truncate">
            {newsletter.brandName}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-caption-assistive">
            <Icon src="/images/Line Clock.svg" size={20} />
            {newsletter.publicationCycle}
          </span>
        </div>
      </Link>
      <Button
        variant={isSubscribed ? 'neutral-outline' : 'outline'}
        size="xs"
        disabled={isPending || newsletter.id == null}
        aria-label={isSubscribed ? '구독 중지' : '구독 재개'}
        onClick={() => newsletter.id != null && onAction(newsletter.id)}
        className="shrink-0"
      >
        {isSubscribed ? '구독중지' : '구독재개'}
      </Button>
    </div>
  );
});
