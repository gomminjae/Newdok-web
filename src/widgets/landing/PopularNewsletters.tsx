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
    <section className="px-5 py-12 md:py-16">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-caption-heavy mb-5">
          지금 인기 있는 뉴스레터
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {POPULAR_NEWSLETTERS.map((nl, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 bg-bg border border-line-disabled rounded-xl p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[10px] bg-neutral-150 flex items-center justify-center text-lg flex-shrink-0">
                  {nl.icon}
                </div>
                <span className="text-sm font-semibold text-caption-heavy truncate">
                  {nl.name}
                </span>
              </div>
              <p className="text-xs text-caption-alternative leading-snug line-clamp-2">
                {nl.desc}
              </p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {nl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] py-[3px] px-2 rounded-full bg-tint-50 text-primary whitespace-nowrap"
                  >
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
