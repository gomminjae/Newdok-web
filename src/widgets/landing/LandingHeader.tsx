'use client';

import Link from 'next/link';
import { useAuth } from '@/shared/hooks';
import { AppImage, ButtonLink, Icon } from '@/shared/ui';

export function LandingHeader() {
  const { isLoggedIn } = useAuth();
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] items-center justify-between border-b border-line-neutral bg-bg px-4 md:px-6 xl:px-8">
      <Link href="/" aria-label="Newdok 홈" className="flex h-11 shrink-0 items-center">
        <AppImage
          name="logo"
          alt="Newdok"
          width={140}
          height={32}
          className="h-7 w-auto sm:h-8"
        />
      </Link>
      <nav aria-label="랜딩 페이지 바로가기" className="flex items-center gap-3">
        {!isLoggedIn && <ButtonLink href="/intro" variant="ghost" size="compact">회원가입</ButtonLink>}
        <Link
          href={isLoggedIn ? '/home' : '/login'}
          className="text-sm font-medium text-primary transition-colors hover:text-primary-strong"
        >
          {isLoggedIn ? '내 뉴스레터' : '로그인'}
        </Link>
        <Link
          href="/search/newsletters"
          aria-label="뉴스레터 검색"
          className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-bg-system"
        >
          <Icon name="Line Search" />
        </Link>
      </nav>
    </header>
  );
}
