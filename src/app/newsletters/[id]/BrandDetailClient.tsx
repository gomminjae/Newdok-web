'use client';

import { Button, ButtonLink, Chip, SubscriptionBadge, Toast } from '@/shared/ui';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsletterQueries, usePauseSubscription, useResumeSubscription, type BrandDetail } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { ApiError } from '@/shared/api/client';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

type Notice = { message: string; isError: boolean };

export function BrandDetailClient({ id, initialBrand }: { id: number; initialBrand?: BrandDetail }) {
  const { isLoggedIn } = useAuth();
  const [visibleCount, setVisibleCount] = useState(12);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const pause = usePauseSubscription();
  const resume = useResumeSubscription();
  const { data: brand, isPending, isError, refetch } = useQuery({
    ...newsletterQueries.brand(id, isLoggedIn),
    initialData: isLoggedIn ? undefined : initialBrand,
    initialDataUpdatedAt: 0,
  });

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (isPending) {
    return <p role="status" className="py-24 text-center text-primary">뉴스레터를 불러오는 중이에요.</p>;
  }
  if (!brand || isError) {
    return (
      <div role="alert" className="py-24 text-center">
        <h1 className="text-xl font-bold">뉴스레터를 불러오지 못했어요.</h1>
        <Button variant="ghost" size="compact" onClick={() => void refetch()} className="mt-5">다시 시도</Button>
        <div className="mt-3"><ButtonLink href="/search" variant="neutral-outline" size="compact">뉴스레터 둘러보기</ButtonLink></div>
      </div>
    );
  }

  const status = isLoggedIn ? brand.isSubscribed : undefined;
  const isActive = status === 'CONFIRMED';
  const isPaused = status === 'PAUSED';
  const isChecking = status === 'CHECK';
  const isUpdating = pause.isPending || resume.isPending;
  const subscribeUrl = /^https?:\/\//i.test(brand.subscribeUrl) ? brand.subscribeUrl : null;

  async function changeSubscription() {
    if (isUpdating || !isLoggedIn || (!isActive && !isPaused)) return;
    setNotice(null);
    try {
      if (isActive) await pause.mutateAsync(id);
      else await resume.mutateAsync(id);
      setNotice({ message: isActive ? '구독이 중지되었습니다.' : '구독이 재개되었습니다.', isError: false });
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.serverMessage ?? '구독 상태를 변경하지 못했어요. 다시 시도해주세요.' : '구독 상태를 변경하지 못했어요. 다시 시도해주세요.',
        isError: true,
      });
    }
  }

  return (
    <div className="-mx-4 min-h-[calc(100dvh-var(--header-height))] bg-bg-system px-4 pb-8 sm:-mx-6 sm:px-6 min-[960px]:pt-5 xl:-mx-10 xl:px-8">
      <div className="relative grid min-w-0 min-[960px]:grid-cols-2 min-[960px]:grid-rows-[auto_1fr] min-[960px]:gap-x-3 min-[960px]:gap-y-2">
        <div className="relative -mx-4 h-[260px] overflow-hidden rounded-b-xl bg-bg shadow-[0_2px_4px_#1919190a] sm:-mx-6 min-[960px]:mx-0 min-[960px]:row-span-2 min-[960px]:h-full min-[960px]:min-h-64 min-[960px]:rounded-xl [&>span]:h-full [&>span]:aspect-auto">
          <NewsletterImage name={brand.brandName} imageUrl={brand.imageUrl} cover />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/[0.06]" />
          {isChecking && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-base font-medium text-white">구독 확인 중</div>}
        </div>

        <section aria-label="뉴스레터 구독" className="relative z-10 -mt-[52px] flex min-w-0 items-center justify-between gap-3 rounded-lg bg-bg/60 px-6 pt-5 pb-[21px] shadow-[0_4px_8px_#0000000a] backdrop-blur-xl min-[960px]:col-start-2 min-[960px]:mt-0 min-[960px]:bg-bg">
          <div className="min-w-0">
            <h2 className="break-words text-base font-bold text-caption-heavy">{brand.brandName}</h2>
            <p className="mt-1 flex items-start gap-1 text-xs font-medium leading-5 text-caption-neutral">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0"><circle cx="10" cy="10" r="7.5" stroke="currentColor" /><path d="M10 5v5l3.5 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {brand.publicationCycle || '발행 일정은 발행처에서 확인해주세요.'}
            </p>
          </div>
          {isActive || isPaused ? (
            <Button size="short" variant={isActive ? 'neutral-outline' : 'outline'} disabled={isUpdating} aria-haspopup={isActive ? 'dialog' : undefined} onClick={() => isActive ? setShowPauseDialog(true) : void changeSubscription()} className="w-[95px] shrink-0">
              {isUpdating ? '변경 중…' : isActive ? '구독중지' : '구독재개'}
            </Button>
          ) : isChecking ? (
            <Button size="short" variant="neutral-outline" disabledTone="preserve" disabled className="w-[95px] shrink-0">확인중</Button>
          ) : subscribeUrl ? (
            <ButtonLink href={subscribeUrl} target="_blank" rel="noopener noreferrer" size="short" aria-label="발행처에서 구독하기 (새 창)" className="w-[95px] shrink-0">구독하기</ButtonLink>
          ) : <span className="shrink-0 text-xs text-caption-assistive">구독 준비 중</span>}
        </section>

        <section aria-label="뉴스레터 소개" className="flex min-w-0 flex-col py-6 min-[960px]:col-start-2 min-[960px]:rounded-xl min-[960px]:bg-bg min-[960px]:p-5 min-[960px]:shadow-[0_1px_2px_#00000005]">
          <p className="whitespace-pre-line break-words text-sm leading-6 text-caption-body">{brand.detailDescription || '뉴스레터의 지난 아티클을 읽어보세요.'}</p>
          {!isActive && !isPaused && !isChecking && subscribeUrl && <p className="mt-2 text-xs leading-5 text-caption-alternative">구독 신청은 발행처 페이지에서 진행돼요.</p>}
          <div className="absolute inset-x-0 top-3 flex items-start justify-between gap-3 min-[960px]:static min-[960px]:mt-auto min-[960px]:pt-6">
            <ul aria-label="관심사" className="flex flex-wrap gap-1.5">
              {brand.interests.slice(0, 3).map((interest) => <li key={interest.id}><Chip>{interest.name}</Chip></li>)}
            </ul>
            {(isActive || isPaused) && <SubscriptionBadge status={isActive ? 'CONFIRMED' : 'PAUSED'} size="compact" />}
          </div>
        </section>
      </div>

      <section aria-labelledby="brand-articles" className="mt-5 min-w-0 min-[960px]:mt-8">
        <h2 id="brand-articles" className="mb-2 px-1 text-sm font-bold text-caption-neutral">지난 아티클 보기</h2>
        {brand.brandArticleList.length ? (
          <ul className="space-y-2">
            {brand.brandArticleList.slice(0, visibleCount).map((article) => {
              const published = formatPublicationDate(article.date);
              return <li key={article.id}>
                <Link href={`/articles/${article.id}`} className="block min-w-0 rounded-lg border border-line-neutral bg-bg p-4 transition-colors hover:border-tint-200">
                  <h3 className="line-clamp-2 break-words text-sm font-bold leading-5 text-caption-strong">{article.title}</h3>
                  <time dateTime={article.date} className="mt-2 flex flex-wrap items-center gap-x-2 text-xs font-medium leading-4 text-caption-neutral">
                    <span>{published.date}</span>
                    {published.time && <><span aria-hidden="true" className="text-line-neutral">|</span><span>{published.time}</span></>}
                  </time>
                </Link>
              </li>;
            })}
          </ul>
        ) : <div className="pt-5 text-center"><p className="text-base font-bold text-caption-heavy">아티클을 준비하는 중이에요.</p><p className="mt-1 text-sm font-medium text-caption-neutral">조금만 기다려 주세요!</p></div>}
        {visibleCount < brand.brandArticleList.length && (
          <Button variant="neutral-outline" size="compact" fullWidth onClick={() => setVisibleCount((count) => count + 12)} className="mt-5">아티클 더 보기</Button>
        )}
      </section>

      {showPauseDialog && <PauseSubscriptionDialog brandName={brand.brandName} onClose={() => setShowPauseDialog(false)} onConfirm={() => { setShowPauseDialog(false); void changeSubscription(); }} />}
      {notice && (notice.isError ? <div role="alert" className="pointer-events-none fixed inset-x-6 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] z-50 mx-auto flex min-h-14 max-w-[600px] items-center justify-center rounded-lg bg-caption-strong px-4 py-3 text-center text-sm font-medium text-white sm:bottom-6 sm:left-[calc(var(--sidebar-width)+24px)]">{notice.message}</div> : <Toast message={notice.message} />)}
    </div>
  );
}

function PauseSubscriptionDialog({ brandName, onClose, onConfirm }: { brandName: string; onClose: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={onClose} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }} className="fixed inset-0 m-auto max-h-[calc(100dvh-48px)] w-[calc(100%-48px)] max-w-[400px] overflow-y-auto rounded-[12px] bg-bg p-6 text-center backdrop:bg-black/30">
    <img src="/images/app/warning.png" alt="" width="80" height="80" className="mx-auto h-20 w-20" />
    <h2 id={titleId} className="text-xl font-bold text-caption-heavy">‘{brandName}’<br />구독 중지</h2>
    <p id={descriptionId} className="mt-1.5 text-sm font-medium text-caption-body">구독을 중지하면 더이상<br />새로운 아티클이 수신되지 않아요.</p>
    <p className="my-6 rounded-[6px] bg-bg-secondary p-4 text-xs font-medium text-primary">구독 재개로 언제든 아티클을 다시 받아볼 수 있어요.</p>
    <div className="flex gap-2">
      <Button variant="neutral-outline" autoFocus onClick={onClose} className="flex-1">취소</Button>
      <Button onClick={onConfirm} className="flex-1">구독 중지</Button>
    </div>
  </dialog>;
}

function formatPublicationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, time: '' };
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', timeZone: 'Asia/Seoul',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}(${part('weekday')})`,
    time: new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Seoul' }).format(date),
  };
}
