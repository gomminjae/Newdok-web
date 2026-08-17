import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section aria-labelledby="landing-title" className="mx-auto w-full max-w-[648px]">
      <h1 id="landing-title" className="sr-only">
        지금 내게 필요한 뉴스레터,
        가장 빠르게 찾는 방법
      </h1>
      <div className="relative overflow-hidden bg-[#f7f7fa]">
        <Image
          src="/images/landing/hero.png"
          alt=""
          width={648}
          height={338}
          preload
          sizes="(max-width: 768px) 100vw, 648px"
          className="h-auto w-full"
        />
        <Link
          href="/search"
          aria-label="뉴스레터 추천받기"
          className="absolute left-[37%] top-[51%] h-[15%] w-[26%] rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span className="sr-only">뉴스레터 추천받기</span>
        </Link>
      </div>
    </section>
  );
}
