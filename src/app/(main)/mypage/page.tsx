'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';
import { useAuth } from '@/shared/hooks';
import { Button, GuestNotice, Toast } from '@/shared/ui';

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const { data: profile } = useQuery({
    ...userQueries.profile(),
    enabled: isLoggedIn,
  });

  const nickname = profile?.nickname ?? '';
  const subscribeEmail = profile?.subscribeEmail ?? '';

  const handleCopyEmail = useCallback(async () => {
    if (!subscribeEmail) return;
    try {
      await navigator.clipboard.writeText(subscribeEmail);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setShowToast(true);
      toastTimer.current = setTimeout(() => setShowToast(false), 2100);
    } catch {
      setShowToast(false);
    }
  }, [subscribeEmail]);

  if (!isLoggedIn) {
    return (
      <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
        <GuestNotice />
      </div>
    );
  }

  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg pt-5 sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
      {/* 프로필 영역 */}
      <div className="flex flex-col gap-4 px-5">
        <p className="line-clamp-2 pt-8 text-base font-bold text-caption-heavy">{nickname}</p>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-caption-neutral">구독이메일</span>
          <button type="button" aria-label="구독 이메일 도움말" className="flex h-6 w-6 items-center justify-center text-caption-neutral">
            <img src="/images/Line Question mark.svg" alt="" width={20} height={20} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label="구독 이메일 복사"
            disabled={!subscribeEmail}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-primary disabled:opacity-50"
          >
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M7.931 17.586A1.931 1.931 0 0 1 6 15.655V8.207A2.207 2.207 0 0 1 8.207 6h7.448a1.93 1.93 0 0 1 1.931 1.931M19.793 10.414h-7.172a2.207 2.207 0 0 0-2.207 2.207v7.172A2.207 2.207 0 0 0 12.621 22h7.172A2.207 2.207 0 0 0 22 19.793v-7.172a2.207 2.207 0 0 0-2.207-2.207Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="text-sm text-caption-heavy truncate">{subscribeEmail}</span>
        </div>

        <Button variant="neutral-outline" size="compact" fullWidth className="mt-3">
          프로필 편집
        </Button>
      </div>

      {/* 서비스 메뉴 */}
      <MenuSection
        title="서비스"
        items={['알림 설정']}
      />

      <hr className="mt-6 border-line-neutral" />

      {/* 고객센터 메뉴 */}
      <div className="px-5">
        <p className="text-xs text-caption-assistive pt-6 pb-2">고객센터</p>
        <MenuItem label="FAQ" />
        <MenuItem label="서비스 피드백" />
        <MenuItem label="약관 및 정책" />
        <div className="flex items-center justify-between h-12">
          <span className="text-base font-medium text-caption-strong">버전</span>
          <span className="text-sm font-medium text-caption-assistive">1.0.0</span>
        </div>
      </div>

      <div className="mt-auto border-t border-line-neutral px-5 pb-4">
        <p className="pb-2 pt-6 text-xs text-caption-assistive">기타</p>
        <MenuItem label="로그아웃" onClick={logout} />
      </div>

      {showToast && <Toast message="구독 이메일 주소가 복사되었습니다." />}
    </div>
  );
}

function MenuSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="px-5">
      <p className="text-xs text-caption-assistive pt-6 pb-2">{title}</p>
      {items.map((label) => (
        <MenuItem key={label} label={label} />
      ))}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-between bg-bg text-left transition-colors hover:bg-bg-system"
    >
      <span className="text-base font-medium text-caption-strong">{label}</span>
      <img src="/images/Line right.svg" alt="" width={24} height={24} />
    </button>
  );
}
