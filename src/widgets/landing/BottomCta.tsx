import Link from 'next/link';

export function BottomCta() {
  return (
    <div className="mx-5 md:mx-auto my-12 md:my-16 max-w-[960px] py-12 px-6 md:py-14 md:px-10 text-center rounded-[20px] bg-gradient-to-br from-indigo-600 to-indigo-500">
      <h2 className="text-[22px] md:text-[26px] font-bold text-white leading-snug mb-6">
        나를 위한 뉴스레터 구독,
        <br />
        뉴독에서 더욱 편리하게
      </h2>
      <Link
        href="/home"
        className="inline-block px-9 py-3.5 bg-white text-primary text-base font-bold rounded-[28px] transition-transform hover:scale-[1.03]"
      >
        뉴스레터 구독하기
      </Link>
    </div>
  );
}
