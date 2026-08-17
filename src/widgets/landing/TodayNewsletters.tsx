import Link from 'next/link';

const TODAY_NEWSLETTERS = [
  {
    brand: 'CCC 팝카레터',
    desc: '오늘의 문화와 트렌드를 감각적으로 소개해요.',
    accent: 'from-[#1d6cff] to-[#073eeb]',
  },
  {
    brand: 'CCC 경제레터',
    desc: '꼭 알아야 할 경제 이야기를 쉽게 전해요.',
    accent: 'from-[#2456ff] to-[#4a1fff]',
  },
  {
    brand: 'CCC 커리어레터',
    desc: '일하는 사람을 위한 새로운 관점을 전해요.',
    accent: 'from-[#0967ee] to-[#043fc3]',
  },
] as const;

const NEW_NEWSLETTERS = [
  { name: '아임레터', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', label: 'im', color: 'bg-emerald-500' },
  { name: '아트맵 ART MAP', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', label: 'ART', color: 'bg-neutral-100 text-caption-heavy' },
  { name: '삶의레터', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', label: '삶', color: 'bg-orange-400' },
  { name: '목요레터', desc: '뉴스레터 간단 소개글로 최대 25자까지 입력됩니다.', label: '목', color: 'bg-sky-500' },
] as const;

export function TodayNewsletters() {
  return (
    <section className="px-5 pb-12 sm:px-8 sm:pb-14">
      <div className="mx-auto w-full max-w-[648px]">
        <h2 className="mb-4 text-base font-bold text-caption-heavy sm:text-lg">
          오늘 구독하면 내일 도착
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TODAY_NEWSLETTERS.map((newsletter) => (
            <li key={newsletter.brand}>
              <Link
                href="/search"
                className="block h-full overflow-hidden rounded-xl border border-line-disabled bg-bg transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br ${newsletter.accent}`}
                  aria-hidden="true"
                >
                  <span className="absolute -left-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border-[10px] border-black/90" />
                  <span className="absolute right-1 text-[42px] font-black tracking-[-0.12em] text-black/90">
                    CCC
                  </span>
                  <span className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-widest text-white">
                    newsletter
                  </span>
                </span>
                <span className="block p-3">
                  <strong className="block text-sm font-bold text-caption-heavy">
                    {newsletter.brand}
                  </strong>
                  <span className="mt-1.5 block text-xs leading-snug text-caption-alternative">
                    {newsletter.desc}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] text-primary">
                      #시사·이슈
                    </span>
                    <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] text-primary">
                      #비즈니스
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mb-4 mt-10 text-base font-bold text-caption-heavy sm:text-lg">
          NEW! 새로 등록된 뉴스레터
        </h2>
        <ul className="space-y-2.5">
          {NEW_NEWSLETTERS.map((newsletter) => (
            <li key={newsletter.name}>
              <Link
                href="/search"
                className="flex items-center gap-3 rounded-xl border border-line-disabled bg-bg p-3 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg text-[11px] font-extrabold text-white ${newsletter.color}`}
                  aria-hidden="true"
                >
                  {newsletter.label}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm font-bold text-caption-heavy">
                    {newsletter.name}
                  </strong>
                  <span className="mt-0.5 block truncate text-xs text-caption-alternative">
                    {newsletter.desc}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
