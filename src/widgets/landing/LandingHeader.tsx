import Image from 'next/image';
import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] items-center justify-between border-b border-line-disabled bg-bg px-4 sm:px-6 xl:px-8">
      <Link href="/" aria-label="Newdok 홈">
        <Image
          src="/images/landing/newdok-logo.svg"
          alt="Newdok"
          width={90}
          height={16}
          className="h-4 w-auto"
        />
      </Link>
      <nav aria-label="랜딩 페이지 바로가기" className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-primary transition-colors hover:text-primary-strong"
        >
          로그인
        </Link>
        <Link
          href="/search"
          aria-label="뉴스레터 검색"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-bg-system"
        >
          <Image src="/images/Line Search.svg" alt="" width={20} height={20} />
        </Link>
      </nav>
    </header>
  );
}
