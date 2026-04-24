import styles from './landing.module.scss';

export function DiscoverSection() {
  return (
    <section className={styles.discoverSection}>
      <div className={styles.inner}>
        <h2 className={styles.discoverTitle}>
          뉴독에서 다양한
          <br />
          뉴스레터를 만나보세요
        </h2>
        <p className={styles.discoverDesc}>
          요즘 뜨는 트렌드부터 깊은 인사이트까지,
          <br />
          흥미로운 뉴스레터가 기다리고 있어요.
        </p>
      </div>
    </section>
  );
}
