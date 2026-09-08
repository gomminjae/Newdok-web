import Link from 'next/link';

export function BottomCta() {
  return (
    <section className="w-full bg-gradient-to-br from-[#6991f1] to-[#5378df] px-6 py-14 text-center sm:py-16">
      <h2 className="mb-6 text-[22px] font-bold leading-snug text-white sm:text-[26px]">
        나를 위한 뉴스레터 구독,
        <br />
        뉴독에서 더욱 편리하게
      </h2>
      <Link
        href="/search"
        className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white transition-colors hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        뉴스레터 둘러보기
      </Link>
    </section>
  );
}
