'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/shared/hooks';

export function LandingHeader() {
  const { isLoggedIn } = useAuth();
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] items-center justify-between border-b border-line-neutral bg-bg px-4 sm:px-6 xl:px-8">
      <Link href="/" aria-label="Newdok 홈">
        <Image
          src="/images/landing/newdok-logo.svg"
          alt="Newdok"
          width={90}
          height={16}
          className="h-4 w-auto"
        />
      </Link>
      <nav aria-label="랜딩 페이지 바로가기" className="flex items-center gap-3">
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
          <Image src="/images/Line Search.svg" alt="" width={24} height={24} />
        </Link>
      </nav>
    </header>
  );
}
