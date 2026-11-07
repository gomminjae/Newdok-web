import Image from 'next/image';
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
        관심 주제와 산업을 관심사로 등록하세요.
        <br className="hidden md:block" />
        뉴독이 대신 찾아드립니다.
      </>
    ),
    image: '/images/landing/feature-recommendation.svg',
    imageWidth: 280,
    imageHeight: 280,
    imageAlt: '봉투에서 다양한 뉴스레터가 펼쳐지는 모습',
    muted: true,
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
        복잡하게 쌓여가는 이메일은 안녕!
        <br />
        이제 뉴스레터만 깔끔하게 모아볼 수 있어요.
      </>
    ),
    image: '/images/landing/feature-inbox.png',
    imageWidth: 280,
    imageHeight: 280,
    imageAlt: '오늘 도착한 뉴스레터를 보여주는 달력',
    muted: false,
    reverse: true,
  },
  {
    title: (
      <>
        어려운 구독 중지도
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
    image: '/images/landing/feature-subscription.png',
    imageWidth: 264,
    imageHeight: 264,
    imageAlt: '뉴스레터 구독을 정리하는 파란 우편함',
    muted: true,
    reverse: false,
  },
];

export function FeatureSections() {
  return (
    <>
      {FEATURES.map((f, i) => (
        <section
          key={i}
          className={clsx(f.muted ? 'bg-landing-muted' : 'bg-bg')}
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-16">
            <div
              className={clsx(
                'grid items-center gap-5 md:grid-cols-2 md:gap-8 lg:gap-20',
                f.reverse && 'md:[&>*:first-child]:order-2',
              )}
            >
              <div className="text-center md:text-left">
                <h2 className="mb-3 text-xl font-bold leading-snug text-primary md:text-[22px]">
                  {f.title}
                </h2>
                <p className="text-sm leading-relaxed text-caption-neutral">
                  {f.desc}
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src={f.image}
                  alt={f.imageAlt}
                  width={f.imageWidth}
                  height={f.imageHeight}
                  sizes="(max-width: 640px) 70vw, 280px"
                  className="h-auto w-full max-w-[264px] md:max-w-[280px]"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
