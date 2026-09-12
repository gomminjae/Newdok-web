'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/shared/hooks';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isSearch = pathname === '/search/newsletters';
  const isHome = pathname === '/home';
  const isProfile = pathname === '/mypage';
  const isNewsletterDetail = /^\/newsletters\/\d+$/.test(pathname ?? '');
  const Title = isNewsletterDetail ? 'p' : 'h1';
  const title = isSearch ? '검색' : pathname === '/search' ? '둘러보기'
    : pathname === '/home' ? '홈'
    : pathname === '/explore' ? '내 구독'
    : pathname === '/bookmarks' ? '북마크함'
    : pathname === '/mypage' ? '마이페이지' : isNewsletterDetail ? '뉴스레터 홈' : '뉴스레터 모아보기';

  return (
    <header className={clsx(isSearch || isProfile ? 'hidden sm:grid' : 'flex sm:grid', 'sticky top-0 z-40 h-[var(--header-height)] items-center justify-between px-5 sm:grid-cols-[var(--sidebar-width)_minmax(0,1fr)_auto] sm:px-0', isHome ? 'bg-bg-system sm:bg-bg' : 'bg-bg')}>
      <Link href="/" aria-label="Newdok 홈" className={clsx(isHome ? 'flex' : 'hidden sm:flex', 'h-11 items-center justify-center')}>
        <span className={clsx('block', isHome ? 'w-[140px] sm:w-[90px]' : 'w-[90px]')}>
          {isHome && <Image src="/images/app/home-logo.png" alt="Newdok" width={140} height={32} className="h-8 w-[140px] sm:hidden" />}
          <Image src="/images/landing/newdok-logo.svg" alt="Newdok" width={90} height={16} className={clsx('h-4 w-[90px] max-w-none', isHome && 'hidden sm:block')} />
        </span>
      </Link>
      {isNewsletterDetail && <button type="button" aria-label="뒤로 가기" onClick={() => window.history.length > 1 ? router.back() : router.replace('/search')} className="flex h-11 w-11 items-center justify-center sm:hidden">
        <Image src="/images/Back.svg" alt="" width={24} height={24} />
      </button>}
      <Title className={clsx('font-bold sm:block sm:pl-5 sm:text-left sm:text-sm sm:font-medium', isHome && 'hidden', isNewsletterDetail ? 'flex-1 text-center text-base' : 'text-lg')}>{title}</Title>
      <div className="flex items-center justify-center gap-3 sm:pr-5">
        {pathname !== '/search' && !isNewsletterDetail && <Link href={isLoggedIn ? '/mypage' : '/login'} className="hidden text-xs text-caption-neutral sm:block">{isLoggedIn ? '내 계정' : '로그인'}</Link>}
        {isNewsletterDetail && <span className="w-11 sm:hidden" />}
        {!isSearch && <Link href="/search/newsletters" aria-label="뉴스레터 검색" className={clsx('h-11 w-11 items-center justify-center rounded-full hover:bg-bg-system', isNewsletterDetail ? 'hidden sm:flex' : 'flex')}>
          <Image src="/images/Line Search.svg" alt="" width={24} height={24} />
        </Link>}
      </div>
    </header>
  );
}
