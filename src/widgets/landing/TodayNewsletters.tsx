import styles from './landing.module.scss';

const TODAY_NEWSLETTERS = [
  {
    brand: 'CCC 팝카레터',
    desc: '인제에서의 너의 감성까지도 유행하더라 이제까지 이런 팝업은 없었다',
    icon: '🎨',
  },
  {
    brand: 'CCC 정카레터',
    desc: '인제에서의 너의 감성까지도 유행하더라 이제까지 이런 정보는 없었다',
    icon: '📊',
  },
  {
    brand: 'CCC 핑카레터',
    desc: '인제에서의 너의 감성까지도 유행하더라 이제까지 이런 핑크는 없었다',
    icon: '💖',
  },
];

const NEW_NEWSLETTERS = [
  { name: '트렌더빗', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', color: 'Purple' as const },
  { name: '국민동네 ART MAP', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', color: 'Blue' as const },
  { name: '포지텔러', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', color: 'Pink' as const },
  { name: '목요레터&볼레터', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', color: 'Green' as const },
];

const ICON_STYLES: Record<string, string> = {
  Purple: styles.newItemIconPurple,
  Blue: styles.newItemIconBlue,
  Pink: styles.newItemIconPink,
  Green: styles.newItemIconGreen,
};

const ICON_LETTERS: Record<string, string> = {
  Purple: '트',
  Blue: 'A',
  Pink: '포',
  Green: '목',
};

export function TodayNewsletters() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.sectionTitle}>오늘 구독하면 내일 도착</h2>
        <div className={styles.todayGrid}>
          {TODAY_NEWSLETTERS.map((nl, i) => (
            <div key={i} className={styles.todayCard}>
              <div className={styles.todayCardImage}>{nl.icon}</div>
              <div className={styles.todayCardBody}>
                <h3 className={styles.todayCardBrand}>{nl.brand}</h3>
                <p className={styles.todayCardDesc}>{nl.desc}</p>
                <div className={styles.cardTags}>
                  <span className={styles.tag}>#트렌드</span>
                  <span className={styles.tag}>#라이프</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className={styles.newListTitle}>NEW! 새로 등록된 뉴스레터</h3>
        <div className={styles.newList}>
          {NEW_NEWSLETTERS.map((nl, i) => (
            <div key={i} className={styles.newItem}>
              <div className={`${styles.newItemIcon} ${ICON_STYLES[nl.color]}`}>
                {ICON_LETTERS[nl.color]}
              </div>
              <div className={styles.newItemText}>
                <div className={styles.newItemName}>{nl.name}</div>
                <div className={styles.newItemDesc}>{nl.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
