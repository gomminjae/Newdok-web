'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/shared/hooks';

const NAV_ITEMS = [
  { href: '/home', label: '홈', lineIcon: '/images/Line Home.svg', fillIcon: '/images/Fill Home.svg' },
  { href: '/explore', label: '내 구독', lineIcon: '/images/Line Mailbox.svg', fillIcon: '/images/Fill Mailbox.svg' },
  { href: '/bookmarks', label: '북마크함', lineIcon: '/images/Line Bookmark.svg', fillIcon: '/images/Fill Bookmark.svg' },
  { href: '/search', label: '둘러보기', lineIcon: '/images/Line Newsletter.svg', fillIcon: '/images/Fill Newsletter.svg' },
  { href: '/mypage', label: '마이페이지', lineIcon: '/images/Line User.svg', fillIcon: '/images/Fill User.svg' },
] as const;

export function Sidebar() {
  const pathname = usePathname() ?? '/';
  const { isLoggedIn } = useAuth();
  const navItems = isLoggedIn ? NAV_ITEMS : [
    { ...NAV_ITEMS[0], href: '/' },
    NAV_ITEMS[3],
    { ...NAV_ITEMS[4], href: '/login', label: '로그인' },
  ];
  const isItemActive = (href: string) => pathname === href ||
    (href === '/' && pathname === '/home') ||
    (href === '/search' && pathname.startsWith('/newsletters'));

  return (
    <>
      <nav aria-label="주 메뉴" className="hidden xl:flex fixed left-0 top-[var(--header-height)] w-[var(--sidebar-width)] h-[calc(100dvh-var(--header-height))] bg-bg border-r border-line-disabled p-4 z-40 flex-col">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ href, label, lineIcon, fillIcon }) => {
            const isActive = isItemActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group relative flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-[11px] transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-tint-50 text-primary font-semibold'
                      : 'text-caption-alternative hover:bg-bg-system hover:text-caption-heavy',
                  )}
                >
                  <span
                    className={clsx(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-primary transition-all duration-200 ease-out',
                      isActive ? 'h-6 opacity-100' : 'h-0 opacity-0',
                    )}
                  />
                  <img
                    src={isActive ? fillIcon : lineIcon}
                    alt=""
                    width={28}
                    height={28}
                    className="transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-95"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="하단 메뉴" className="xl:hidden fixed bottom-0 left-0 right-0 flex bg-bg border-t border-line-disabled py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-40">
        {navItems.map(({ href, label, lineIcon, fillIcon }) => {
          const isActive = isItemActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'group flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-caption-assistive',
              )}
            >
              <img
                src={isActive ? fillIcon : lineIcon}
                alt=""
                width={20}
                height={20}
                className={clsx(
                  'transition-transform duration-200 ease-out group-active:scale-90',
                  isActive && '-translate-y-0.5',
                )}
              />
              <span className="text-[11px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
