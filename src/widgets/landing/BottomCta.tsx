import Link from 'next/link';
import styles from './landing.module.scss';

export function BottomCta() {
  return (
    <div className={styles.bottomCta}>
      <h2 className={styles.bottomCtaTitle}>
        나를 위한 뉴스레터 구독,
        <br />
        뉴독에서 더욱 편리하게
      </h2>
      <Link href="/home" className={styles.bottomCtaButton}>
        뉴스레터 구독하기
      </Link>
    </div>
  );
}
