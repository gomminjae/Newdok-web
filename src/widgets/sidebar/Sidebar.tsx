'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Icon } from '@/shared/ui';

const NAV_ITEMS = [
  { href: '/home', label: '홈', lineIcon: '/images/Line Home.svg', fillIcon: '/images/Fill Home.svg' },
  { href: '/explore', label: '구독관리', lineIcon: '/images/Line Mailbox.svg', fillIcon: '/images/Fill Mailbox.svg' },
  { href: '/bookmarks', label: '북마크함', lineIcon: '/images/Line Bookmark.svg', fillIcon: '/images/Fill Bookmark.svg' },
  { href: '/search', label: '둘러보기', lineIcon: '/images/Line Newsletter.svg', fillIcon: '/images/Fill Newsletter.svg' },
  { href: '/mypage', label: '마이페이지', lineIcon: '/images/Line User.svg', fillIcon: '/images/Fill User.svg' },
] as const;

export function Sidebar() {
  const pathname = usePathname() ?? '/';
  const isNewsletterDetail = /^\/newsletters\/\d+$/.test(pathname);
  const mobileItems = [NAV_ITEMS[3], NAV_ITEMS[1], NAV_ITEMS[0], NAV_ITEMS[2], NAV_ITEMS[4]];
  const isItemActive = (href: string) => pathname === href ||
    (href === '/home' && (pathname === '/' || isNewsletterDetail)) ||
    (href === '/search' && (pathname === '/newsletters' || pathname.startsWith('/search/')));

  return (
    <>
      <nav aria-label="주 메뉴" className="hidden sm:flex fixed left-0 top-[var(--header-height)] w-[var(--sidebar-width)] h-[calc(100dvh-var(--header-height))] bg-bg px-2 py-2 min-[960px]:px-4 z-40 flex-col">
        <ul className="flex flex-col gap-3 min-[960px]:gap-1">
          {NAV_ITEMS.map(({ href, label, lineIcon, fillIcon }) => {
            const isActive = isItemActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[11px] min-[960px]:flex-row min-[960px]:gap-2 min-[960px]:py-2.5 min-[960px]:text-xs transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-tint-50 text-primary font-semibold'
                      : 'text-caption-alternative hover:bg-bg-system hover:text-caption-heavy',
                  )}
                >
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

      <nav aria-label="하단 메뉴" className="sm:hidden fixed bottom-0 left-0 right-0 flex min-h-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] bg-bg pb-[env(safe-area-inset-bottom)] z-40">
        {mobileItems.map(({ href, label, lineIcon }) => {
          const isActive = isItemActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'group flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-caption-assistive',
              )}
            >
              <Icon src={lineIcon} size={28} />
              <span className="text-[10px] leading-3">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
