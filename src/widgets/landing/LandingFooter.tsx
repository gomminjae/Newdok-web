import Image from 'next/image';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl bg-bg px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Image
          src="/images/landing/newdok-logo.svg"
          alt="Newdok"
          width={90}
          height={16}
          className="h-4 w-auto"
        />
        <nav aria-label="Newdok 외부 채널" className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-xs text-caption-alternative transition-colors hover:text-caption-heavy"
          >
            뉴스레터 둘러보기
          </Link>
        </nav>
      </div>
      <p className="mt-5 text-[11px] text-caption-assistive">
        Copyright Newdok. All rights reserved.
      </p>
      <nav aria-label="정책" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-caption-assistive">
        <a href="https://newdok.notion.site/18aacf9713bc427a850ae8da92b69087?pvs=4" target="_blank" rel="noopener noreferrer">이용약관 ↗</a>
        <a href="https://newdok.notion.site/82ef5aea46d84623b7b19bb951b6043c?pvs=4" target="_blank" rel="noopener noreferrer">개인정보처리방침 ↗</a>
      </nav>
    </footer>
  );
}
