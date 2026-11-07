'use client';

import Link from 'next/link';
import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  subscriptionQueries,
  usePauseSubscription,
  useResumeSubscription,
  type SubscribedNewsletter,
} from '@/entities/newsletter';
import { useAuth, useToast } from '@/shared/hooks';
import { AppImage, Button, Dialog, EmptyState, Icon, SegmentPicker, Toast } from '@/shared/ui';
import { getErrorMessage } from '@/shared/api/client';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

type Tab = 'active' | 'paused';
const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: 'active', label: '구독 중' },
  { value: 'paused', label: '구독 중지' },
];

export default function ExplorePage() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>('active');
  const { message, showToast } = useToast();
  const [confirmation, setConfirmation] = useState<SubscribedNewsletter | null>(null);
  const [actionError, setActionError] = useState('');
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();

  const activeQuery = useQuery({
    ...subscriptionQueries.active(),
    enabled: isLoggedIn && tab === 'active',
  });

  const pausedQuery = useQuery({
    ...subscriptionQueries.paused(),
    enabled: isLoggedIn && tab === 'paused',
  });

  const currentQuery = tab === 'active' ? activeQuery : pausedQuery;
  const currentList = currentQuery.data ?? [];
  const isLoading = currentQuery.isLoading;
  const isUpdating = pauseMutation.isPending || resumeMutation.isPending;

  async function changeSubscription(id: number, action: Tab) {
    if (isUpdating) return;
    setActionError('');
    try {
      if (action === 'active') await pauseMutation.mutateAsync(id);
      else await resumeMutation.mutateAsync(id);
      setConfirmation(null);
      showToast(action === 'active' ? '구독이 중지되었습니다.' : '구독이 재개되었습니다.');
    } catch (error) { setActionError(getErrorMessage(error, '구독 상태를 변경하지 못했어요. 다시 시도해주세요.')); }
  }
  function handleAction(id: number) {
    if (isUpdating) return;
    setActionError('');
    if (tab === 'active') setConfirmation(currentList.find((item) => item.id === id) ?? null);
    else void changeSubscription(id, 'paused');
  }
  const pendingId = pauseMutation.isPending ? pauseMutation.variables
    : resumeMutation.isPending ? resumeMutation.variables : undefined;

  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg-system md:-mx-6 md:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
      {/* 세그먼트 피커 */}
      <div className="flex px-4 py-4">
        <SegmentPicker value={tab} options={TABS} onChange={setTab} className="w-full" />
      </div>

      {actionError && !confirmation && <p role="alert" className="px-5 py-3 text-sm text-error">{actionError}</p>}
      {confirmation && <Dialog title="구독 중지" busy={isUpdating} onClose={() => { setConfirmation(null); setActionError(''); }}><p className="text-sm leading-7">‘{confirmation.brandName}’ 구독을 중지할까요? 새로운 아티클 수신이 중지되며 언제든 재개할 수 있어요.</p>{actionError && <p role="alert" className="mt-4 text-sm text-error">{actionError}</p>}<div className="mt-6 flex gap-2"><Button variant="neutral-outline" disabled={isUpdating} onClick={() => setConfirmation(null)} className="flex-1">취소</Button><Button disabled={isUpdating || confirmation.id == null} onClick={() => confirmation.id != null && void changeSubscription(confirmation.id, 'active')} className="flex-1">{isUpdating ? '변경 중…' : '구독 중지'}</Button></div></Dialog>}
      {message && <Toast message={message} />}
      {!isLoggedIn ? (
        <SubscriptionEmpty tab={tab} guest />
      ) : isLoading ? (
        <div className="flex items-center justify-center flex-1 bg-bg-system text-primary">
          로딩 중...
        </div>
      ) : currentQuery.isError ? (
        <div role="alert"><EmptyState title="구독 목록을 불러오지 못했어요." cta={<Button onClick={() => void currentQuery.refetch()}>다시 시도</Button>} /></div>
      ) : currentList.length === 0 ? (
        <SubscriptionEmpty tab={tab} />
      ) : (
        <>
          <div className="bg-bg-system px-5 pb-4 pt-1">
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
          <div className="flex-1 bg-bg-system px-4 pb-7 flex flex-col gap-2">
            {currentList.map((nl) => (
              <SubscribeRow
                key={nl.id}
                newsletter={nl}
                isSubscribed={tab === 'active'}
                isPending={isUpdating || nl.id === pendingId}
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
      <AppImage name="nosubscribe" alt="" width={280} height={280} className="mb-6 mt-5 h-[280px] w-[280px] max-w-full object-contain" />
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
    <div className="flex items-center gap-2 rounded-lg border border-line-neutral bg-bg px-4 py-3 shadow-subscription-card">
      <Link
        href={newsletter.id != null ? `/newsletters/${newsletter.id}` : '#'}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <NewsletterImage name={newsletter.brandName} imageUrl={newsletter.imageUrl} variant="thumbnail" />
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-base font-bold text-caption-heavy truncate">
            {newsletter.brandName}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-caption-assistive">
            <Icon name="Line Clock" size={20} />
            {newsletter.publicationCycle}
          </span>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
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
