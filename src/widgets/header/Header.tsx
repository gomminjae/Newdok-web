import Link from 'next/link';
import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span>N</span> newdok
      </Link>
      <div className={styles.headerRight}>
        <Link href="/login" className={styles.loginButton}>
          로그인
        </Link>
      </div>
    </header>
  );
}
