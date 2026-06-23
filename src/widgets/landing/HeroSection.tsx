import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="text-center px-5 py-12 md:py-16 bg-gradient-to-b from-bg to-bg-system">
      <h1 className="text-2xl md:text-[32px] font-bold leading-snug text-caption-heavy mb-6">
        지금 내게 필요한 뉴스레터,
        <br />
        가장 빠르게 찾는 방법
      </h1>
      <Link
        href="/home"
        className="inline-block px-8 py-3.5 bg-primary text-white text-base font-semibold rounded-[28px] mb-8 hover:bg-primary-strong transition-colors"
      >
        뉴스레터 추천받기
      </Link>
      <div className="max-w-[320px] md:max-w-[400px] mx-auto aspect-[4/3] rounded-[20px] flex items-center justify-center text-[64px] bg-gradient-to-br from-blue-100 to-indigo-200">
        📨
      </div>
    </section>
  );
}
