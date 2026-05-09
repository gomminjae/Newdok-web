'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { href: '/home', label: '홈', lineIcon: '/images/Line Home.svg', fillIcon: '/images/Fill Home.svg' },
  { href: '/explore', label: '내 구독', lineIcon: '/images/Line Mailbox.svg', fillIcon: '/images/Fill Mailbox.svg' },
  { href: '/bookmarks', label: '북마크함', lineIcon: '/images/Line Bookmark.svg', fillIcon: '/images/Fill Bookmark.svg' },
  { href: '/search', label: '둘러보기', lineIcon: '/images/Line Newsletter.svg', fillIcon: '/images/Fill Newsletter.svg' },
  { href: '/mypage', label: '마이페이지', lineIcon: '/images/Line User.svg', fillIcon: '/images/Fill User.svg' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 데스크탑: 사이드바 */}
      <nav className={styles.sidebar}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ href, label, lineIcon, fillIcon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <Image
                    src={isActive ? fillIcon : lineIcon}
                    alt={label}
                    width={28}
                    height={28}
                    className={styles.icon}
                  />
                  <span className={styles.label}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 모바일: 하단 탭바 */}
      <nav className={styles.tabbar}>
        {NAV_ITEMS.map(({ href, label, lineIcon, fillIcon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
            >
              <Image
                src={isActive ? fillIcon : lineIcon}
                alt={label}
                width={20}
                height={20}
                className={styles.icon}
              />
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
