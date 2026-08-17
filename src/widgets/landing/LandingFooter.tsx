import Image from 'next/image';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-[648px] bg-bg-system px-5 py-8 sm:px-8">
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
            href="/mypage"
            className="text-xs text-caption-alternative transition-colors hover:text-caption-heavy"
          >
            마이페이지
          </Link>
          <Link
            href="#"
            className="text-xs text-caption-alternative transition-colors hover:text-caption-heavy"
            aria-label="Newdok Instagram"
          >
            Instagram
          </Link>
        </nav>
      </div>
      <p className="mt-5 text-[11px] text-caption-assistive">
        Copyright Newdok. All rights reserved.
      </p>
      <nav aria-label="정책" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-caption-assistive">
        <Link href="#">이용약관</Link>
        <Link href="#">개인정보처리방침</Link>
        <Link href="#">고객센터</Link>
      </nav>
    </footer>
  );
}
