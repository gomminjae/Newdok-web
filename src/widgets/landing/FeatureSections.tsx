import { clsx } from 'clsx';

const FEATURES = [
  {
    title: (
      <>
        일일이 찾아볼 필요 없이
        <br />
        내게 필요한 뉴스레터만 쏙쏙
      </>
    ),
    desc: (
      <>
        어떤 뉴스레터를 구독해야 할지 모르겠다면
        <br />
        좋아 보이는 신문과 관심사를 등록하세요.
        <br />
        뉴독이 대신 찾아드립니다.
      </>
    ),
    bg: 'bg-gradient-to-br from-violet-100 to-blue-100',
    emoji: '📋',
    alt: false,
    reverse: false,
  },
  {
    title: (
      <>
        다른 메일과 섞이지 않고
        <br />
        오늘 받는 뉴스레터만 한눈에
      </>
    ),
    desc: (
      <>
        메일앱이 뒤섞이는 메일함은 안 쓸래요
        <br />
        이제 뉴스레터만 깔끔하게 모아볼 수 있어요.
      </>
    ),
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    emoji: '📱',
    alt: false,
    reverse: true,
  },
  {
    title: (
      <>
        어디로 구독 중지도
        <br />
        뉴독에서는 쉽고 빠르게
      </>
    ),
    desc: (
      <>
        그만 보고 싶은 뉴스레터도, 가끔만 보고 싶은 뉴스레터도
        <br />
        버튼 하나로 간편하게 관리하세요.
      </>
    ),
    bg: 'bg-gradient-to-br from-pink-100 to-violet-100',
    emoji: '⚡',
    alt: true,
    reverse: false,
  },
];

export function FeatureSections() {
  return (
    <>
      {FEATURES.map((f, i) => (
        <section
          key={i}
          className={clsx('px-5 py-12 md:py-16', f.alt && 'bg-bg-system')}
        >
          <div className="max-w-[960px] mx-auto">
            <div
              className={clsx(
                'flex flex-col items-center gap-6 md:gap-10',
                f.reverse ? 'md:flex-row-reverse' : 'md:flex-row',
              )}
            >
              <div className="flex-1">
                <h2 className="text-[22px] md:text-[26px] font-bold leading-snug text-caption-heavy mb-3">
                  {f.title}
                </h2>
                <p className="text-sm text-caption-alternative leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <div
                className={clsx(
                  'flex-1 w-full max-w-[360px] aspect-[4/3] rounded-2xl flex items-center justify-center text-[56px]',
                  f.bg,
                )}
              >
                {f.emoji}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
