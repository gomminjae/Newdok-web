'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/shared/hooks';
import { AppImage, Icon } from '@/shared/ui';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useAuth();
  const isSearch = pathname === '/search';
  const isHome = pathname === '/home';
  const isNewsletterDetail = /^\/newsletters\/\d+$/.test(pathname ?? '');
  const Title = isNewsletterDetail ? 'p' : 'h1';
  const title = isSearch ? '검색' : pathname === '/explore' ? '둘러보기'
    : pathname === '/home' ? '홈'
    : pathname === '/subscribe' ? '내 구독'
    : pathname === '/bookmarks' ? '북마크함'
    : pathname === '/mypage' ? '마이페이지' : isNewsletterDetail ? '뉴스레터 홈' : '뉴스레터 모아보기';

  return (
    <header data-home={isHome ? '' : undefined} className={clsx('flex md:grid', 'sticky top-0 z-40 h-[var(--header-height)] items-center justify-between px-5 md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)_auto] md:px-0', isHome ? 'bg-bg-system md:bg-bg' : 'bg-bg')}>
      <Link href="/" aria-label="Newdok 홈" className={clsx(isHome || isSearch ? 'flex' : 'hidden md:flex', 'h-11 items-center justify-center')}>
        <AppImage name="logo" alt="Newdok" width={140} height={32} className="h-8 w-auto md:h-6 xl:h-8" />
      </Link>
      {!isHome && !isSearch && !isNewsletterDetail && <Link href="/home" aria-label="홈으로 이동" className="-ml-3 flex h-11 w-11 items-center justify-center text-caption-heavy md:ml-0 md:hidden"><Icon name="Line Home" /></Link>}
      {isNewsletterDetail && <button type="button" aria-label="뒤로 가기" onClick={() => window.history.length > 1 ? router.back() : router.replace('/explore')} className="flex h-11 w-11 items-center justify-center md:hidden">
        <Icon name="Back" />
      </button>}
      <Title className={clsx('font-bold md:block md:pl-5 md:text-left md:text-sm md:font-medium', (isHome || isSearch) && 'hidden', 'flex-1 text-center text-base')}>{title}</Title>
      <div className="-mr-3 flex items-center justify-center gap-3 md:mr-0 md:pr-5">
        {pathname !== '/explore' && !isNewsletterDetail && (isHydrated
          ? <Link href={isLoggedIn ? '/mypage' : '/login'} className="hidden w-12 text-xs text-caption-neutral md:block">{isLoggedIn ? '내 계정' : '로그인'}</Link>
          : <span aria-hidden="true" className="hidden w-12 md:block" />)}
        {isNewsletterDetail && <span className="w-11 md:hidden" />}
        {!isSearch && <Link href="/search" aria-label="뉴스레터 검색" className={clsx('h-11 w-11 items-center justify-center rounded-full hover:bg-bg-system', isNewsletterDetail ? 'hidden md:flex' : 'flex')}>
          <Icon name="Line Search" />
        </Link>}
      </div>
    </header>
  );
}
