import styles from './landing.module.scss';

const POPULAR_NEWSLETTERS = [
  {
    name: '뉴스레터 브랜드명',
    icon: '📬',
    desc: '새로 떠오르는 소식 뉴스레터!',
    tags: ['#트렌드', '#비즈니스', '#IT'],
  },
  {
    name: '뉴스레터 브랜드명',
    icon: '📰',
    desc: '새로 떠오르는 소식 뉴스레터!',
    tags: ['#뉴스레터', '#브랜드명'],
  },
  {
    name: '뉴스레터 브랜드명',
    icon: '💡',
    desc: '트렌드와 인사이트를 한눈에!',
    tags: ['#경제', '#투자'],
  },
  {
    name: '뉴스레터 브랜드명',
    icon: '🎯',
    desc: '매일 아침 꼭 필요한 소식만!',
    tags: ['#마케팅', '#커리어'],
  },
];

export function PopularNewsletters() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.sectionTitle}>지금 인기 있는 뉴스레터</h2>
        <div className={styles.popularGrid}>
          {POPULAR_NEWSLETTERS.map((nl, i) => (
            <div key={i} className={styles.newsletterCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{nl.icon}</div>
                <span className={styles.cardBrandName}>{nl.name}</span>
              </div>
              <p className={styles.cardDesc}>{nl.desc}</p>
              <div className={styles.cardTags}>
                {nl.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
