'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Icon } from '@/shared/ui';

const NAV_ITEMS = [
  { href: '/home', label: '홈', lineIcon: 'Line Home' },
  { href: '/subscribe', label: '구독관리', lineIcon: 'Line Mailbox' },
  { href: '/bookmarks', label: '북마크함', lineIcon: 'Line Bookmark' },
  { href: '/explore', label: '둘러보기', lineIcon: 'Line Newsletter' },
  { href: '/mypage', label: '마이페이지', lineIcon: 'Line User' },
] as const;

export function Sidebar() {
  const pathname = usePathname() ?? '/';
  const isNewsletterDetail = /^\/newsletters\/\d+$/.test(pathname);
  const mobileItems = [NAV_ITEMS[3], NAV_ITEMS[1], NAV_ITEMS[0], NAV_ITEMS[2], NAV_ITEMS[4]];
  const isItemActive = (href: string) => pathname === href ||
    (href === '/home' && (pathname === '/' || isNewsletterDetail)) ||
    (href === '/explore' && pathname === '/newsletters');

  return (
    <>
      <nav aria-label="주 메뉴" className="hidden md:flex fixed left-0 top-[var(--header-height)] w-[var(--sidebar-width)] h-[calc(100dvh-var(--header-height))] bg-bg px-3 py-2 z-40 flex-col">
        <ul className="flex flex-col gap-3 xl:gap-1">
          {NAV_ITEMS.map(({ href, label, lineIcon }) => {
            const isActive = isItemActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[11px] xl:flex-row xl:gap-2 xl:py-2.5 xl:text-sm transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-tint-50 text-primary font-semibold'
                      : 'text-caption-alternative hover:bg-bg-system hover:text-caption-heavy',
                  )}
                >
                  <Icon name={lineIcon} size={28} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="하단 메뉴" className="md:hidden fixed bottom-0 left-0 right-0 flex min-h-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] bg-bg pb-[env(safe-area-inset-bottom)] z-40">
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
              <Icon name={lineIcon} size={24} />
              <span className="text-[10px] leading-3">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
