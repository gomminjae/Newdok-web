'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';
import { useAuth } from '@/shared/hooks';
import { GuestNotice } from '@/shared/ui';

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);

  const { data: profile } = useQuery({
    ...userQueries.profile(),
    enabled: isLoggedIn,
  });

  const nickname = profile?.nickname ?? '';
  const subscribeEmail = profile?.subscribeEmail ?? '';

  const handleCopyEmail = useCallback(() => {
    if (!subscribeEmail) return;
    navigator.clipboard.writeText(subscribeEmail);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2100);
  }, [subscribeEmail]);

  if (!isLoggedIn) {
    return (
      <div className="bg-bg min-h-[calc(100vh-49px)] flex flex-col">
        <GuestNotice />
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-[calc(100vh-49px)] flex flex-col pt-5">
      {/* 프로필 영역 */}
      <div className="px-5">
        <p className="text-base font-bold text-caption-heavy pt-8 mb-4">{nickname}</p>

        <div className="flex items-center gap-1 mb-2">
          <span className="text-sm font-medium text-caption-neutral">구독이메일</span>
          <button type="button" className="bg-transparent p-0.5 flex items-center text-caption-neutral">
            <img src="/images/Line Question mark.svg" alt="도움말" width={16} height={16} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-6">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="bg-transparent p-0.5 flex items-center"
          >
            <img src="/images/Line Copy.svg" alt="복사" width={24} height={24} />
          </button>
          <span className="text-sm text-caption-heavy truncate">{subscribeEmail}</span>
        </div>

        <button
          type="button"
          className="w-full h-11 bg-transparent border border-neutral-150 rounded text-sm font-bold text-caption-neutral mt-3 hover:bg-neutral-50 transition-colors"
        >
          프로필 편집
        </button>
      </div>

      {/* 서비스 메뉴 */}
      <MenuSection
        title="서비스"
        items={['계정 관리', '알림 설정']}
      />

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

      <button
        type="button"
        onClick={logout}
        className="mx-5 mt-3 mb-20 h-12 border border-neutral-150 rounded-lg bg-bg text-sm font-semibold text-caption-neutral hover:bg-neutral-50 transition-colors"
      >
        로그아웃
      </button>

      {showToast && (
        <div
          className="fixed bottom-[106px] left-1/2 -translate-x-1/2 bg-black/75 text-white px-6 py-3 rounded-lg text-sm font-medium z-[1000]"
          style={{ animation: 'fadeInOut 2s ease-in-out' }}
        >
          구독 이메일 주소가 복사되었습니다.
        </div>
      )}
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

function MenuItem({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between w-full h-12 bg-transparent text-left"
    >
      <span className="text-base font-medium text-caption-strong">{label}</span>
      <img src="/images/Line right.svg" alt="" width={24} height={24} />
    </button>
  );
}
