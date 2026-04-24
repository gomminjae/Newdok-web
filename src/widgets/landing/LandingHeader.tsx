import Link from 'next/link';
import styles from './landing.module.scss';

export function LandingHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span>N</span> newdok
      </div>
      <div className={styles.headerRight}>
        <Link href="/login" className={styles.loginButton}>
          로그인
        </Link>
      </div>
    </header>
  );
}
