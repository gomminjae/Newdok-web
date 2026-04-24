import Link from 'next/link';
import styles from './landing.module.scss';

export function LandingFooter() {
  return (
    <footer>
      <div className={styles.footer}>
        <div className={styles.footerLogo}>
          <span>N</span> newdok
        </div>
        <div className={styles.footerLinks}>
          <Link href="#" className={styles.footerLink} aria-label="Profile">
            👤
          </Link>
          <Link href="#" className={styles.footerLink} aria-label="Instagram">
            📷
          </Link>
        </div>
      </div>
      <p className={styles.footerCopyright}>
        Copyright Newdok. All rights reserved.
      </p>
    </footer>
  );
}
