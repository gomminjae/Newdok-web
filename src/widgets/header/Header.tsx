import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] items-center justify-between px-5 xl:px-10 bg-bg border-b border-line-disabled">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xl font-extrabold text-caption-heavy"
      >
        <span className="text-primary">N</span> newdok
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-caption-alternative hover:text-caption-heavy transition-colors"
        >
          로그인
        </Link>
      </div>
    </header>
  );
}
