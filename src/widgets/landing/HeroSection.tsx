import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section aria-labelledby="landing-title" className="bg-[#f7f7fa]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-[1.2fr_1fr] md:gap-10 lg:py-20">
        <div>
          <p className="mb-4 text-xs font-bold tracking-widest text-primary">A NEW LETTER, A NEW DAY</p>
          <h1 id="landing-title" className="text-[30px] font-bold leading-[1.3] tracking-tight sm:text-[40px] lg:text-5xl">
            지금 내게 필요한<br />
            <span className="text-primary">뉴스레터를 발견하세요.</span>
          </h1>
          <p className="mt-5 text-sm leading-7 text-caption-neutral sm:text-base">
            새로운 소식부터 깊이 있는 이야기까지.<br />
            나의 관심사에 맞는 뉴스레터를 한곳에서 만나보세요.
          </p>
          <Link href="/search" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-7 text-base font-bold text-white transition-colors hover:bg-primary-strong sm:w-auto">
            뉴스레터 둘러보기 →
          </Link>
          <p className="mt-3 text-xs text-caption-alternative">회원가입 없이 바로 둘러볼 수 있어요.</p>
        </div>
        <Image src="/images/landing/feature-recommendation.svg" alt="다양한 뉴스레터가 펼쳐지는 우편 봉투"
          width={360} height={360} preload sizes="(max-width: 768px) 240px, 360px"
          className="mx-auto h-auto w-full max-w-[240px] md:max-w-[360px]" />
      </div>
    </section>
  );
}
