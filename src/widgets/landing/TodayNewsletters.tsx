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

const ICON_CLASSES: Record<string, string> = {
  Purple: 'bg-violet-100 text-violet-600',
  Blue: 'bg-blue-100 text-blue-600',
  Pink: 'bg-pink-100 text-pink-600',
  Green: 'bg-emerald-100 text-emerald-600',
};

const ICON_LETTERS: Record<string, string> = {
  Purple: '트',
  Blue: 'A',
  Pink: '포',
  Green: '목',
};

export function TodayNewsletters() {
  return (
    <section className="px-5 py-12 md:py-16">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-caption-heavy mb-5">
          오늘 구독하면 내일 도착
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TODAY_NEWSLETTERS.map((nl, i) => (
            <div
              key={i}
              className="bg-bg border border-line-disabled rounded-xl overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="w-full aspect-[3/2] flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-200 via-indigo-300 to-indigo-400">
                {nl.icon}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-caption-heavy mb-1.5">
                  {nl.brand}
                </h3>
                <p className="text-xs text-caption-alternative leading-snug line-clamp-2 mb-2">
                  {nl.desc}
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[11px] py-[3px] px-2 rounded-full bg-tint-50 text-primary">
                    #트렌드
                  </span>
                  <span className="text-[11px] py-[3px] px-2 rounded-full bg-tint-50 text-primary">
                    #라이프
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-base font-bold text-caption-heavy mt-10 mb-4">
          NEW! 새로 등록된 뉴스레터
        </h3>
        <div className="flex flex-col">
          {NEW_NEWSLETTERS.map((nl, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3.5 border-b border-line-disabled"
            >
              <div
                className={`w-11 h-11 rounded-[10px] flex items-center justify-center text-base flex-shrink-0 ${ICON_CLASSES[nl.color]}`}
              >
                {ICON_LETTERS[nl.color]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-caption-heavy mb-0.5">
                  {nl.name}
                </div>
                <div className="text-xs text-caption-alternative truncate">
                  {nl.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
