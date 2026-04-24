import Link from 'next/link';
import styles from './landing.module.scss';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        지금 내게 필요한 뉴스레터,
        <br />
        가장 빠르게 찾는 방법
      </h1>
      <Link href="/home" className={styles.heroCta}>
        뉴스레터 추천받기
      </Link>
      <div className={styles.heroImageWrap}>📨</div>
    </section>
  );
}
